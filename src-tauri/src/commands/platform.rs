#[tauri::command]
pub fn get_platform() -> &'static str {
    #[cfg(target_os = "windows")]
    {
        "windows"
    }

    #[cfg(target_os = "macos")]
    {
        "macos"
    }

    #[cfg(target_os = "linux")]
    {
        "linux"
    }
}
