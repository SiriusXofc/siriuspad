use std::{
    collections::HashMap,
    io::{Read, Write},
    sync::{Arc, Mutex},
    thread,
};

use portable_pty::{native_pty_system, CommandBuilder, MasterPty, PtySize};
use tauri::{AppHandle, Emitter, Manager, State};
use uuid::Uuid;

#[derive(Default)]
pub struct TerminalState {
    sessions: Mutex<HashMap<String, Arc<TerminalSession>>>,
}

struct TerminalSession {
    writer: Mutex<Box<dyn Write + Send>>,
    master: Mutex<Box<dyn MasterPty + Send>>,
    child: Mutex<Box<dyn portable_pty::Child + Send>>,
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalSessionInfo {
    pub session_id: String,
    pub shell: String,
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct TerminalDataPayload {
    session_id: String,
    data: String,
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct TerminalExitPayload {
    session_id: String,
}

fn shell_program() -> (&'static str, Vec<&'static str>) {
    if cfg!(target_os = "windows") {
        ("cmd.exe", Vec::new())
    } else {
        ("bash", vec!["-i"])
    }
}

fn normalize_terminal_size(cols: u16, rows: u16) -> PtySize {
    PtySize {
        rows: rows.max(18),
        cols: cols.max(60),
        pixel_width: 0,
        pixel_height: 0,
    }
}

fn remove_session(app: &AppHandle, session_id: &str) {
    let state = app.state::<TerminalState>();
    let Ok(mut sessions) = state.sessions.lock() else {
        return;
    };
    sessions.remove(session_id);
}

#[tauri::command]
pub fn terminal_create_session(
    app: AppHandle,
    state: State<'_, TerminalState>,
    cwd: Option<String>,
    cols: u16,
    rows: u16,
) -> Result<TerminalSessionInfo, String> {
    let pty_system = native_pty_system();
    let pair = pty_system
        .openpty(normalize_terminal_size(cols, rows))
        .map_err(|error| error.to_string())?;

    let (shell, args) = shell_program();
    let mut command = CommandBuilder::new(shell);
    for arg in args {
        command.arg(arg);
    }

    if let Some(cwd) = cwd.as_deref().filter(|value| !value.trim().is_empty()) {
        command.cwd(cwd);
    }

    command.env("TERM", "xterm-256color");
    command.env("COLORTERM", "truecolor");
    command.env("TERM_PROGRAM", "SiriusPad");

    let child = pair
        .slave
        .spawn_command(command)
        .map_err(|error| error.to_string())?;
    drop(pair.slave);

    let mut reader = pair
        .master
        .try_clone_reader()
        .map_err(|error| error.to_string())?;
    let writer = pair
        .master
        .take_writer()
        .map_err(|error| error.to_string())?;

    let session_id = Uuid::new_v4().to_string();
    let session = Arc::new(TerminalSession {
        writer: Mutex::new(writer),
        master: Mutex::new(pair.master),
        child: Mutex::new(child),
    });

    if let Ok(mut sessions) = state.sessions.lock() {
        sessions.insert(session_id.clone(), session.clone());
    }

    let reader_app = app.clone();
    let reader_session_id = session_id.clone();
    thread::spawn(move || {
        let mut buffer = [0_u8; 8192];

        loop {
            match reader.read(&mut buffer) {
                Ok(0) => break,
                Ok(read) => {
                    let data = String::from_utf8_lossy(&buffer[..read]).to_string();
                    let _ = reader_app.emit(
                        "terminal://data",
                        TerminalDataPayload {
                            session_id: reader_session_id.clone(),
                            data,
                        },
                    );
                }
                Err(_) => break,
            }
        }

        remove_session(&reader_app, &reader_session_id);
        let _ = reader_app.emit(
            "terminal://exit",
            TerminalExitPayload {
                session_id: reader_session_id,
            },
        );
    });

    Ok(TerminalSessionInfo {
        session_id,
        shell: shell.to_string(),
    })
}

#[tauri::command]
pub fn terminal_write(
    state: State<'_, TerminalState>,
    session_id: String,
    data: String,
) -> Result<(), String> {
    let sessions = state.sessions.lock().map_err(|error| error.to_string())?;
    let session = sessions
        .get(&session_id)
        .cloned()
        .ok_or_else(|| "Sessão do terminal não encontrada.".to_string())?;
    drop(sessions);

    let mut writer = session.writer.lock().map_err(|error| error.to_string())?;
    writer
        .write_all(data.as_bytes())
        .map_err(|error| error.to_string())?;
    writer.flush().map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn terminal_interrupt(
    state: State<'_, TerminalState>,
    session_id: String,
) -> Result<(), String> {
    let sessions = state.sessions.lock().map_err(|error| error.to_string())?;
    let session = sessions
        .get(&session_id)
        .cloned()
        .ok_or_else(|| "Sessão do terminal não encontrada.".to_string())?;
    drop(sessions);

    let mut writer = session.writer.lock().map_err(|error| error.to_string())?;
    writer.write_all(&[3]).map_err(|error| error.to_string())?;
    writer.flush().map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn terminal_resize(
    state: State<'_, TerminalState>,
    session_id: String,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    let sessions = state.sessions.lock().map_err(|error| error.to_string())?;
    let session = sessions
        .get(&session_id)
        .cloned()
        .ok_or_else(|| "Sessão do terminal não encontrada.".to_string())?;
    drop(sessions);

    let master = session.master.lock().map_err(|error| error.to_string())?;
    master
        .resize(normalize_terminal_size(cols, rows))
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn terminal_close_session(
    app: AppHandle,
    state: State<'_, TerminalState>,
    session_id: String,
) -> Result<(), String> {
    let session = {
        let mut sessions = state.sessions.lock().map_err(|error| error.to_string())?;
        sessions.remove(&session_id)
    };

    if let Some(session) = session {
        let mut child = session.child.lock().map_err(|error| error.to_string())?;
        let _ = child.kill();
    }

    let _ = app.emit(
        "terminal://exit",
        TerminalExitPayload {
            session_id,
        },
    );

    Ok(())
}
