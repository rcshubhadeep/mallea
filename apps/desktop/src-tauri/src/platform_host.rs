// Tauri adapter for the host-independent installed-runtime contract.
use std::{path::PathBuf, process::Command};
use tauri::Manager;

fn runtime_path(path: PathBuf) -> PathBuf {
    // Windows can return extended-length paths. Node's entrypoint resolution expects
    // ordinary drive/UNC paths even though Windows APIs accept both forms.
    #[cfg(windows)] {
        let value = path.to_string_lossy();
        if let Some(tail) = value.strip_prefix(r"\\?\UNC\") { return PathBuf::from(format!(r"\\{}", tail)); }
        if let Some(tail) = value.strip_prefix(r"\\?\") { return PathBuf::from(tail); }
    }
    path
}

pub fn installed_dashboard_config(app: &tauri::AppHandle) -> Result<Option<PathBuf>, String> {
    if app.config().identifier != "dev.mallea.runtime" { return Ok(None); }
    let resources = runtime_path(app.path().resource_dir().map_err(|_| "Installed resources are unavailable.")?).join("runtime");
    if !resources.join("runtime.json").is_file() { return Err("Mallea's runtime files are missing. Reinstall Mallea.".into()); }
    let home = runtime_path(app.path().app_local_data_dir().map_err(|_| "Mallea's data folder is unavailable.")?);
    let host = runtime_path(std::env::current_exe().map_err(|_| "Mallea's app host is unavailable.")?);
    let node = resources.join("bin").join(if cfg!(windows) { "node.exe" } else { "node" });
    let mut command = Command::new(node);
    command.arg("scripts/installed-bootstrap.mjs").arg(home).arg(host).arg(&resources).current_dir(&resources);
    for (key, _) in std::env::vars_os() {
        let name = key.to_string_lossy().to_uppercase();
        if name.starts_with("DEV_") || name.starts_with("PROD_") || name.starts_with("MALLEA_") || name.starts_with("NODE_") || name.contains("KEY") || name.contains("TOKEN") || name.contains("SECRET") || name.contains("PASSWORD") {
            command.env_remove(key);
        }
    }
    #[cfg(windows)] {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000);
    }
    let output = command.output().map_err(|_| "Mallea's private runtime could not start. Reinstall Mallea.")?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).chars().take(600).collect());
    }
    let path = String::from_utf8(output.stdout).map_err(|_| "Core returned an invalid startup result.")?;
    Ok(Some(PathBuf::from(path.trim())))
}
