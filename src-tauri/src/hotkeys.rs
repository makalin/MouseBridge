use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use crate::HotkeyConfig;

pub struct HotkeyManager {
    registered_hotkeys: Arc<Mutex<HashMap<String, HotkeyConfig>>>,
    global_hotkey_enabled: Arc<Mutex<bool>>,
}

impl HotkeyManager {
    pub fn new() -> Self {
        Self {
            registered_hotkeys: Arc::new(Mutex::new(HashMap::new())),
            global_hotkey_enabled: Arc::new(Mutex::new(true)),
        }
    }

    pub async fn register_hotkey(config: HotkeyConfig) -> Result<()> {
        let key = format!("{}+{}", config.modifiers.join("+"), config.key);
        
        // Platform-specific hotkey registration
        #[cfg(target_os = "macos")]
        {
            Self::register_macos_hotkey(&config).await?;
        }
        
        #[cfg(target_os = "windows")]
        {
            Self::register_windows_hotkey(&config).await?;
        }
        
        #[cfg(target_os = "linux")]
        {
            Self::register_linux_hotkey(&config).await?;
        }

        let mut hotkeys = crate::hotkeys::get_global_manager().registered_hotkeys.lock().await;
        hotkeys.insert(key.clone(), config);
        
        log::info!("Registered hotkey: {}", key);
        Ok(())
    }

    pub async fn unregister_hotkey(key: String) -> Result<()> {
        // Platform-specific hotkey unregistration
        #[cfg(target_os = "macos")]
        {
            Self::unregister_macos_hotkey(&key).await?;
        }
        
        #[cfg(target_os = "windows")]
        {
            Self::unregister_windows_hotkey(&key).await?;
        }
        
        #[cfg(target_os = "linux")]
        {
            Self::unregister_linux_hotkey(&key).await?;
        }

        let mut hotkeys = crate::hotkeys::get_global_manager().registered_hotkeys.lock().await;
        hotkeys.remove(&key);
        
        log::info!("Unregistered hotkey: {}", key);
        Ok(())
    }

    pub async fn get_registered_hotkeys() -> Result<Vec<HotkeyConfig>> {
        let hotkeys = crate::hotkeys::get_global_manager().registered_hotkeys.lock().await;
        Ok(hotkeys.values().map(|h| h.clone()).collect())
    }

    pub async fn handle_hotkey_action(action: &str) -> Result<()> {
        match action {
            "lock_cursor" => {
                log::info!("Hotkey triggered: Lock cursor");
                // TODO: Implement cursor locking
            }
            "unlock_cursor" => {
                log::info!("Hotkey triggered: Unlock cursor");
                // TODO: Implement cursor unlocking
            }
            "toggle_connection" => {
                log::info!("Hotkey triggered: Toggle connection");
                // TODO: Implement connection toggling
            }
            "switch_screen" => {
                log::info!("Hotkey triggered: Switch screen");
                // TODO: Implement screen switching
            }
            "emergency_disconnect" => {
                log::info!("Hotkey triggered: Emergency disconnect");
                // TODO: Implement emergency disconnect
            }
            _ => {
                log::warn!("Unknown hotkey action: {}", action);
            }
        }
        Ok(())
    }

    #[cfg(target_os = "macos")]
    async fn register_macos_hotkey(config: &HotkeyConfig) -> Result<()> {
        // macOS hotkey registration using Carbon/Cocoa APIs
        log::debug!("Registering macOS hotkey: {:?}", config);
        Ok(())
    }

    #[cfg(target_os = "macos")]
    async fn unregister_macos_hotkey(key: &str) -> Result<()> {
        // macOS hotkey unregistration
        log::debug!("Unregistering macOS hotkey: {}", key);
        Ok(())
    }

    #[cfg(target_os = "windows")]
    async fn register_windows_hotkey(config: &HotkeyConfig) -> Result<()> {
        // Windows hotkey registration using Win32 APIs
        log::debug!("Registering Windows hotkey: {:?}", config);
        Ok(())
    }

    #[cfg(target_os = "windows")]
    async fn unregister_windows_hotkey(key: &str) -> Result<()> {
        // Windows hotkey unregistration
        log::debug!("Unregistering Windows hotkey: {}", key);
        Ok(())
    }

    #[cfg(target_os = "linux")]
    async fn register_linux_hotkey(config: &HotkeyConfig) -> Result<()> {
        // Linux hotkey registration using X11/Wayland
        log::debug!("Registering Linux hotkey: {:?}", config);
        Ok(())
    }

    #[cfg(target_os = "linux")]
    async fn unregister_linux_hotkey(key: &str) -> Result<()> {
        // Linux hotkey unregistration
        log::debug!("Unregistering Linux hotkey: {}", key);
        Ok(())
    }
}

// Global hotkey manager instance
static mut GLOBAL_HOTKEY_MANAGER: Option<HotkeyManager> = None;

pub fn get_global_manager() -> &'static HotkeyManager {
    unsafe {
        GLOBAL_HOTKEY_MANAGER.get_or_insert_with(HotkeyManager::new)
    }
}

pub async fn register_hotkey(config: HotkeyConfig) -> Result<()> {
    HotkeyManager::register_hotkey(config).await
}

pub async fn unregister_hotkey(key: String) -> Result<()> {
    HotkeyManager::unregister_hotkey(key).await
}

pub async fn get_registered_hotkeys() -> Result<Vec<HotkeyConfig>> {
    HotkeyManager::get_registered_hotkeys().await
}

// Predefined hotkey configurations
pub fn get_default_hotkeys() -> Vec<HotkeyConfig> {
    vec![
        HotkeyConfig {
            key: "L".to_string(),
            modifiers: vec!["Ctrl".to_string(), "Shift".to_string()],
            action: "lock_cursor".to_string(),
            enabled: true,
        },
        HotkeyConfig {
            key: "U".to_string(),
            modifiers: vec!["Ctrl".to_string(), "Shift".to_string()],
            action: "unlock_cursor".to_string(),
            enabled: true,
        },
        HotkeyConfig {
            key: "C".to_string(),
            modifiers: vec!["Ctrl".to_string(), "Alt".to_string()],
            action: "toggle_connection".to_string(),
            enabled: true,
        },
        HotkeyConfig {
            key: "S".to_string(),
            modifiers: vec!["Ctrl".to_string(), "Alt".to_string()],
            action: "switch_screen".to_string(),
            enabled: true,
        },
        HotkeyConfig {
            key: "Escape".to_string(),
            modifiers: vec!["Ctrl".to_string(), "Alt".to_string()],
            action: "emergency_disconnect".to_string(),
            enabled: true,
        },
    ]
} 