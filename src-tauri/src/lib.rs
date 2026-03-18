use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_shell::ShellExt;

/// Keeps the spawned sidecar child process alive for the app lifetime.
struct SidecarState(Mutex<tauri_plugin_shell::process::CommandChild>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                // Dev mode: log plugin active, sidecar must be started manually.
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
                log::info!(
                    "Dev mode: start sidecar manually with \
                     `python -X utf8 sidecar/vocab_server.py`"
                );
            } else {
                // Release mode: spawn the bundled vocab-server sidecar.
                let sidecar_cmd = app
                    .shell()
                    .sidecar("vocab-server")
                    .expect(
                        "vocab-server sidecar not found — \
                         did you build it with PyInstaller?",
                    );

                let (_rx, child) = sidecar_cmd
                    .spawn()
                    .expect("failed to spawn vocab-server sidecar");

                // Store in managed state so the child is not dropped (killing it).
                // The OS cleans up the process when the app exits.
                app.manage(SidecarState(Mutex::new(child)));
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
