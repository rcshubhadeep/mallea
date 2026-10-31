#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use serde::Deserialize;
use serde_json::{json, Value};
use tauri_plugin_dialog::DialogExt;
use base64::Engine;
use std::{path::PathBuf, time::Duration};

#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct HostConfig { version: u32, app_id: String, engine_url: String, credential: String, control_token: Option<String> }
struct NativeHost { config: Option<HostConfig>, client: reqwest::Client }
fn read_host_config() -> Option<HostConfig> {
    let args: Vec<String> = std::env::args().collect();
    let path = args.windows(2).find(|a| a[0] == "--host-config").map(|a| PathBuf::from(&a[1]))
        .or_else(|| std::env::var_os("MALLEA_HOST_CONFIG").map(PathBuf::from))?;
    let config: HostConfig = serde_json::from_slice(&std::fs::read(path).ok()?).ok()?;
    if config.version != 1 || config.engine_url != "http://127.0.0.1:4318" || config.credential.len() != 64 { return None; }
    Some(config)
}
async fn core_call(host: &NativeHost, route: &str) -> Result<Value, String> {
    let c = host.config.as_ref().ok_or("Launch this app with its registered host configuration.")?;
    let response = host.client.post(format!("{}/api/native/{}", c.engine_url, route))
        .json(&json!({"appId":c.app_id,"credential":c.credential})).send().await
        .map_err(|_| "Mallea Core is unavailable. Start Core, then retry.".to_string())?;
    if !response.status().is_success() { return Err("Core did not accept this app identity. Register the project again.".into()); }
    response.json::<Value>().await.map_err(|_| "Core returned an invalid response.".into())
}
#[tauri::command]
async fn native_context(host: tauri::State<'_, NativeHost>, window: tauri::WebviewWindow) -> Result<Value,String> {
    let metadata = core_call(&host,"context").await?;
    if let Some(name) = metadata.get("name").and_then(Value::as_str) { let _ = window.set_title(&format!("{} · Powered by Mallea", name)); }
    Ok(metadata)
}
#[tauri::command]
async fn native_connect(host: tauri::State<'_, NativeHost>) -> Result<Value,String> { core_call(&host,"register").await }

// Dashboard control never exposes its local capability token to Surface code.
#[tauri::command]
async fn core_dashboard(host: tauri::State<'_, NativeHost>, action: String, args: Value) -> Result<Value,String> {
    let c=host.config.as_ref().filter(|c|c.app_id=="mallea-core").ok_or("Only the Core dashboard can manage engine settings and projects.")?;
    let token=c.control_token.as_ref().ok_or("Restart Core and reopen its dashboard.")?;
    if !["state","settings","project","launch"].contains(&action.as_str()) {return Err("Unknown Core operation.".into());}
    let response=host.client.post(format!("{}/api/engine/dashboard",c.engine_url)).header("X-Mallea-Control",token).json(&json!({"action":action,"args":args})).send().await.map_err(|_|"Core is unavailable.".to_string())?;
    let status=response.status();let value:Value=response.json().await.map_err(|_|"Invalid Core response.".to_string())?;
    if !status.is_success(){return Err(value.get("error").and_then(Value::as_str).unwrap_or("Core rejected the operation.").to_string());}Ok(value)
}
#[tauri::command]
async fn choose_project_folder(app: tauri::AppHandle, host: tauri::State<'_, NativeHost>) -> Result<Option<String>,String> {
    if !host.config.as_ref().is_some_and(|c|c.app_id=="mallea-core"&&c.control_token.is_some()){return Err("Open project creation from Core.".into());}
    tauri::async_runtime::spawn_blocking(move||{
        let chosen=app.dialog().file().set_title("Choose the parent folder for your new app").blocking_pick_folder();
        chosen.map(|f|f.into_path().map(|p|p.to_string_lossy().into_owned()).map_err(|_|"Unsupported folder.".to_string())).transpose()
    }).await.map_err(|_|"Folder selection interrupted.".to_string())?
}

// Only an explicit user-selected save destination can leave the Surface runtime.
#[tauri::command]
async fn save_export(app: tauri::AppHandle, format: String, data: String) -> Result<bool,String> {
    if !["txt", "json", "png"].contains(&format.as_str()) || data.len() > 1_600_000 { return Err("Unsupported export.".into()); }
    let bytes = if format == "png" {
        let decoded = base64::engine::general_purpose::STANDARD.decode(data).map_err(|_| "Invalid image export.")?;
        if !decoded.starts_with(&[137,80,78,71,13,10,26,10]) { return Err("Expected saved PNG image.".into()); }
        decoded
    } else { if format == "json" { serde_json::from_str::<Value>(&data).map_err(|_| "Invalid JSON export.")?; } data.into_bytes() };
    tauri::async_runtime::spawn_blocking(move || {
        let chosen=app.dialog().file().set_title("Export Surface data").set_file_name(format!("mallea-export.{}",format)).add_filter("Surface data",&[format.as_str()]).blocking_save_file();
        let Some(chosen)=chosen else {return Ok(false)};
        let path=chosen.into_path().map_err(|_| "Unsupported save destination.".to_string())?;
        std::fs::write(path,bytes).map_err(|_| "Could not save export.".to_string())?; Ok(true)
    }).await.map_err(|_| "Export was interrupted.".to_string())?
}

fn main() {
    let client = reqwest::Client::builder().timeout(Duration::from_secs(10)).no_proxy().redirect(reqwest::redirect::Policy::none()).build().expect("Unable to initialize local Core connection");
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(NativeHost { config: read_host_config(), client })
        .invoke_handler(tauri::generate_handler![native_context,native_connect,save_export,core_dashboard,choose_project_folder])
        .run(tauri::generate_context!())
        .expect("Unable to start Mallea desktop");
}
