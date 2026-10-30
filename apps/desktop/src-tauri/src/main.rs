#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use serde::Deserialize;
use serde_json::{json, Value};
use std::{path::PathBuf, time::Duration};

#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct HostConfig { version: u32, app_id: String, engine_url: String, credential: String }
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

fn main() {
    let client = reqwest::Client::builder().timeout(Duration::from_secs(10)).no_proxy().redirect(reqwest::redirect::Policy::none()).build().expect("Unable to initialize local Core connection");
    tauri::Builder::default()
        .manage(NativeHost { config: read_host_config(), client })
        .invoke_handler(tauri::generate_handler![native_context,native_connect])
        .run(tauri::generate_context!())
        .expect("Unable to start Mallea desktop");
}
