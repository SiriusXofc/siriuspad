use crate::{
    models::{Note, NoteHistoryEntry},
    storage,
};

#[tauri::command]
pub fn list_note_history(note_id: String) -> Result<Vec<NoteHistoryEntry>, String> {
    storage::list_note_history(&note_id)
}

#[tauri::command]
pub fn read_note_version(note_id: String, timestamp: String) -> Result<String, String> {
    storage::read_note_version(&note_id, &timestamp)
}

#[tauri::command]
pub fn restore_note_version(note_id: String, timestamp: String) -> Result<Note, String> {
    storage::restore_note_version(&note_id, &timestamp)
}
