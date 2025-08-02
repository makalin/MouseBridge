#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use mousebridge_lib::{
    bridge::MouseBridgeService,
    config::{Config, ConnectionConfig},
    ClipboardData, HotkeyConfig, AnalyticsData, ServerInfo, ConnectionStatus, PlatformInfo,
};
use tauri::Manager;
use std::sync::Arc;

fn main() {
    env_logger::init();
    
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            
            // Initialize the mouse bridge service
            let bridge_service = Arc::new(MouseBridgeService::new());
            
            // Store the service in the app state
            app_handle.manage(bridge_service);
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            start_server,
            stop_server,
            connect_client,
            disconnect_client,
            get_connection_status,
            get_server_info,
            save_config,
            load_config,
            get_platform_info,
            // Advanced features:
            get_clipboard_content,
            set_clipboard_content,
            enable_clipboard_sharing,
            register_hotkey,
            unregister_hotkey,
            get_registered_hotkeys,
            get_analytics_data,
            reset_analytics,
            list_plugins,
            enable_plugin,
            disable_plugin,
            lock_cursor_to_screen,
            unlock_cursor,
            set_cursor_speed,
            enable_mouse_acceleration,
            test_network_connectivity,
            get_network_interfaces,
            get_system_resources,
            check_permissions,
            request_permissions
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Tauri command handlers
#[tauri::command]
async fn start_server(
    service: tauri::State<'_, Arc<MouseBridgeService>>,
    config: ConnectionConfig,
) -> Result<(), String> {
    service
        .start_server(config)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn stop_server(service: tauri::State<'_, Arc<MouseBridgeService>>) -> Result<(), String> {
    service
        .stop_server()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn connect_client(
    service: tauri::State<'_, Arc<MouseBridgeService>>,
    config: ConnectionConfig,
) -> Result<(), String> {
    service
        .connect_client(config)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn disconnect_client(service: tauri::State<'_, Arc<MouseBridgeService>>) -> Result<(), String> {
    service
        .disconnect_client()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_connection_status(
    service: tauri::State<'_, Arc<MouseBridgeService>>,
) -> Result<ConnectionStatus, String> {
    service
        .get_connection_status()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_server_info(
    service: tauri::State<'_, Arc<MouseBridgeService>>,
) -> Result<ServerInfo, String> {
    service
        .get_server_info()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_config(config: Config) -> Result<(), String> {
    config
        .save()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn load_config() -> Result<Config, String> {
    Config::load()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_platform_info() -> Result<PlatformInfo, String> {
    Ok(PlatformInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        version: std::env::var("OS_VERSION").unwrap_or_else(|_| "Unknown".to_string()),
    })
}

// Clipboard functionality
#[tauri::command]
async fn get_clipboard_content() -> Result<ClipboardData, String> {
    mousebridge_lib::clipboard::get_clipboard_content()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn set_clipboard_content(data: ClipboardData) -> Result<(), String> {
    mousebridge_lib::clipboard::set_clipboard_content(data)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn enable_clipboard_sharing(enable: bool) -> Result<(), String> {
    mousebridge_lib::clipboard::enable_sharing(enable)
        .await
        .map_err(|e| e.to_string())
}

// Hotkey management
#[tauri::command]
async fn register_hotkey(config: HotkeyConfig) -> Result<(), String> {
    mousebridge_lib::hotkeys::register_hotkey(config)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn unregister_hotkey(key: String) -> Result<(), String> {
    mousebridge_lib::hotkeys::unregister_hotkey(key)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_registered_hotkeys() -> Result<Vec<HotkeyConfig>, String> {
    mousebridge_lib::hotkeys::get_registered_hotkeys()
        .await
        .map_err(|e| e.to_string())
}

// Analytics and monitoring
#[tauri::command]
async fn get_analytics_data() -> Result<AnalyticsData, String> {
    mousebridge_lib::analytics::get_session_data()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn reset_analytics() -> Result<(), String> {
    mousebridge_lib::analytics::reset_session()
        .await
        .map_err(|e| e.to_string())
}

// Plugin system
#[tauri::command]
async fn list_plugins() -> Result<Vec<String>, String> {
    mousebridge_lib::plugins::list_available_plugins()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn enable_plugin(plugin_name: String) -> Result<(), String> {
    mousebridge_lib::plugins::enable_plugin(plugin_name)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn disable_plugin(plugin_name: String) -> Result<(), String> {
    mousebridge_lib::plugins::disable_plugin(plugin_name)
        .await
        .map_err(|e| e.to_string())
}

// Advanced features
#[tauri::command]
async fn lock_cursor_to_screen(screen_index: u32) -> Result<(), String> {
    mousebridge_lib::input::lock_cursor_to_screen(screen_index)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn unlock_cursor() -> Result<(), String> {
    mousebridge_lib::input::unlock_cursor()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn set_cursor_speed(speed: f32) -> Result<(), String> {
    mousebridge_lib::input::set_cursor_speed(speed)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn enable_mouse_acceleration(enable: bool) -> Result<(), String> {
    mousebridge_lib::input::enable_mouse_acceleration(enable)
        .await
        .map_err(|e| e.to_string())
}

// Network diagnostics
#[tauri::command]
async fn test_network_connectivity(host: String, port: u16) -> Result<u64, String> {
    mousebridge_lib::network::test_connectivity(host, port)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_network_interfaces() -> Result<Vec<String>, String> {
    mousebridge_lib::network::get_available_interfaces()
        .await
        .map_err(|e| e.to_string())
}

// System utilities
#[tauri::command]
async fn get_system_resources() -> Result<serde_json::Value, String> {
    mousebridge_lib::platform::get_system_resources()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn check_permissions() -> Result<serde_json::Value, String> {
    mousebridge_lib::platform::check_required_permissions()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn request_permissions() -> Result<bool, String> {
    mousebridge_lib::platform::request_required_permissions()
        .await
        .map_err(|e| e.to_string())
} 