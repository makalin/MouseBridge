use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginInfo {
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub enabled: bool,
    pub dependencies: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginConfig {
    pub enabled_plugins: Vec<String>,
    pub plugin_settings: HashMap<String, serde_json::Value>,
}

pub struct PluginManager {
    plugins: Arc<Mutex<HashMap<String, PluginInfo>>>,
    config: Arc<Mutex<PluginConfig>>,
    plugin_dir: PathBuf,
}

impl PluginManager {
    pub fn new() -> Result<Self> {
        let plugin_dir = dirs::config_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("mousebridge")
            .join("plugins");
        
        // Create plugin directory if it doesn't exist
        std::fs::create_dir_all(&plugin_dir)?;
        
        Ok(Self {
            plugins: Arc::new(Mutex::new(HashMap::new())),
            config: Arc::new(Mutex::new(PluginConfig {
                enabled_plugins: Vec::new(),
                plugin_settings: HashMap::new(),
            })),
            plugin_dir,
        })
    }

    pub async fn load_plugins(&self) -> Result<()> {
        // Load built-in plugins
        self.load_builtin_plugins().await?;
        
        // Load external plugins from plugin directory
        self.load_external_plugins().await?;
        
        // Load plugin configuration
        self.load_plugin_config().await?;
        
        log::info!("Plugin system initialized");
        Ok(())
    }

    async fn load_builtin_plugins(&self) -> Result<()> {
        let builtin_plugins = vec![
            PluginInfo {
                name: "clipboard-sync".to_string(),
                version: "1.0.0".to_string(),
                description: "Synchronize clipboard between connected devices".to_string(),
                author: "MouseBridge Team".to_string(),
                enabled: true,
                dependencies: vec![],
            },
            PluginInfo {
                name: "performance-monitor".to_string(),
                version: "1.0.0".to_string(),
                description: "Monitor and optimize performance metrics".to_string(),
                author: "MouseBridge Team".to_string(),
                enabled: true,
                dependencies: vec![],
            },
            PluginInfo {
                name: "auto-reconnect".to_string(),
                version: "1.0.0".to_string(),
                description: "Automatically reconnect on connection loss".to_string(),
                author: "MouseBridge Team".to_string(),
                enabled: true,
                dependencies: vec![],
            },
            PluginInfo {
                name: "gesture-control".to_string(),
                version: "1.0.0".to_string(),
                description: "Enable mouse gesture controls".to_string(),
                author: "MouseBridge Team".to_string(),
                enabled: false,
                dependencies: vec![],
            },
            PluginInfo {
                name: "screen-recorder".to_string(),
                version: "1.0.0".to_string(),
                description: "Record screen activity during sessions".to_string(),
                author: "MouseBridge Team".to_string(),
                enabled: false,
                dependencies: vec!["performance-monitor".to_string()],
            },
        ];

        let mut plugins = self.plugins.lock().await;
        for plugin in builtin_plugins {
            plugins.insert(plugin.name.clone(), plugin);
        }

        Ok(())
    }

    async fn load_external_plugins(&self) -> Result<()> {
        if !self.plugin_dir.exists() {
            return Ok(());
        }

        for entry in std::fs::read_dir(&self.plugin_dir)? {
            let entry = entry?;
            let path = entry.path();
            
            if path.is_file() && path.extension().map_or(false, |ext| ext == "json") {
                if let Ok(content) = std::fs::read_to_string(&path) {
                    if let Ok(plugin_info) = serde_json::from_str::<PluginInfo>(&content) {
                        let mut plugins = self.plugins.lock().await;
                        plugins.insert(plugin_info.name.clone(), plugin_info.clone());
                        log::info!("Loaded external plugin: {}", plugin_info.name);
                    }
                }
            }
        }

        Ok(())
    }

    async fn load_plugin_config(&self) -> Result<()> {
        let config_path = dirs::config_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("mousebridge")
            .join("plugin_config.json");

        if config_path.exists() {
            if let Ok(content) = std::fs::read_to_string(config_path) {
                if let Ok(config) = serde_json::from_str::<PluginConfig>(&content) {
                    *self.config.lock().await = config;
                }
            }
        }

        Ok(())
    }

    async fn save_plugin_config(&self) -> Result<()> {
        let config_path = dirs::config_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("mousebridge")
            .join("plugin_config.json");

        let config = self.config.lock().await;
        let content = serde_json::to_string_pretty(&*config)?;
        std::fs::write(config_path, content)?;

        Ok(())
    }

    pub async fn enable_plugin(&self, plugin_name: String) -> Result<()> {
        let mut plugins = self.plugins.lock().await;
        let mut config = self.config.lock().await;

        if let Some(plugin) = plugins.get_mut(&plugin_name) {
            // Check dependencies
            for dep in &plugin.dependencies {
                if !config.enabled_plugins.contains(dep) {
                    return Err(anyhow::anyhow!("Plugin {} requires dependency {}", plugin_name, dep));
                }
            }

            plugin.enabled = true;
            if !config.enabled_plugins.contains(&plugin_name) {
                config.enabled_plugins.push(plugin_name.clone());
            }

            log::info!("Plugin enabled: {}", plugin_name);
            self.save_plugin_config().await?;
        } else {
            return Err(anyhow::anyhow!("Plugin not found: {}", plugin_name));
        }

        Ok(())
    }

    pub async fn disable_plugin(&self, plugin_name: String) -> Result<()> {
        let mut plugins = self.plugins.lock().await;
        let mut config = self.config.lock().await;

        if let Some(plugin) = plugins.get_mut(&plugin_name) {
            plugin.enabled = false;
            config.enabled_plugins.retain(|name| name != &plugin_name);

            // Disable plugins that depend on this one
            for (name, other_plugin) in plugins.iter_mut() {
                if other_plugin.dependencies.contains(&plugin_name) {
                    other_plugin.enabled = false;
                    config.enabled_plugins.retain(|n| n != name);
                    log::info!("Disabled dependent plugin: {}", name);
                }
            }

            log::info!("Plugin disabled: {}", plugin_name);
            self.save_plugin_config().await?;
        } else {
            return Err(anyhow::anyhow!("Plugin not found: {}", plugin_name));
        }

        Ok(())
    }

    pub async fn list_available_plugins(&self) -> Result<Vec<String>> {
        let plugins = self.plugins.lock().await;
        Ok(plugins.keys().cloned().collect())
    }

    pub async fn get_plugin_info(&self, plugin_name: &str) -> Result<Option<PluginInfo>> {
        let plugins = self.plugins.lock().await;
        Ok(plugins.get(plugin_name).cloned())
    }

    pub async fn get_enabled_plugins(&self) -> Result<Vec<String>> {
        let config = self.config.lock().await;
        Ok(config.enabled_plugins.clone())
    }

    pub async fn execute_plugin_action(&self, plugin_name: &str, action: &str, params: serde_json::Value) -> Result<serde_json::Value> {
        match plugin_name {
            "clipboard-sync" => self.execute_clipboard_sync_action(action, params).await,
            "performance-monitor" => self.execute_performance_monitor_action(action, params).await,
            "auto-reconnect" => self.execute_auto_reconnect_action(action, params).await,
            "gesture-control" => self.execute_gesture_control_action(action, params).await,
            "screen-recorder" => self.execute_screen_recorder_action(action, params).await,
            _ => Err(anyhow::anyhow!("Unknown plugin: {}", plugin_name)),
        }
    }

    async fn execute_clipboard_sync_action(&self, action: &str, _params: serde_json::Value) -> Result<serde_json::Value> {
        match action {
            "enable" => {
                crate::clipboard::enable_sharing(true).await?;
                Ok(serde_json::json!({"status": "enabled"}))
            }
            "disable" => {
                crate::clipboard::enable_sharing(false).await?;
                Ok(serde_json::json!({"status": "disabled"}))
            }
            "status" => {
                Ok(serde_json::json!({"status": "active"}))
            }
            _ => Err(anyhow::anyhow!("Unknown action: {}", action)),
        }
    }

    async fn execute_performance_monitor_action(&self, action: &str, _params: serde_json::Value) -> Result<serde_json::Value> {
        match action {
            "start" => {
                crate::analytics::get_global_manager().start_performance_monitoring().await?;
                Ok(serde_json::json!({"status": "started"}))
            }
            "get_metrics" => {
                let data = crate::analytics::get_session_data().await?;
                Ok(serde_json::to_value(data)?)
            }
            "export_report" => {
                let report = crate::analytics::get_global_manager().export_data().await?;
                Ok(serde_json::json!({"report": report}))
            }
            _ => Err(anyhow::anyhow!("Unknown action: {}", action)),
        }
    }

    async fn execute_auto_reconnect_action(&self, action: &str, _params: serde_json::Value) -> Result<serde_json::Value> {
        match action {
            "enable" => {
                // TODO: Implement auto-reconnect logic
                Ok(serde_json::json!({"status": "enabled"}))
            }
            "disable" => {
                // TODO: Implement auto-reconnect logic
                Ok(serde_json::json!({"status": "disabled"}))
            }
            _ => Err(anyhow::anyhow!("Unknown action: {}", action)),
        }
    }

    async fn execute_gesture_control_action(&self, action: &str, _params: serde_json::Value) -> Result<serde_json::Value> {
        match action {
            "enable" => {
                // TODO: Implement gesture control
                Ok(serde_json::json!({"status": "enabled"}))
            }
            "disable" => {
                // TODO: Implement gesture control
                Ok(serde_json::json!({"status": "disabled"}))
            }
            _ => Err(anyhow::anyhow!("Unknown action: {}", action)),
        }
    }

    async fn execute_screen_recorder_action(&self, action: &str, _params: serde_json::Value) -> Result<serde_json::Value> {
        match action {
            "start" => {
                // TODO: Implement screen recording
                Ok(serde_json::json!({"status": "started"}))
            }
            "stop" => {
                // TODO: Implement screen recording
                Ok(serde_json::json!({"status": "stopped"}))
            }
            _ => Err(anyhow::anyhow!("Unknown action: {}", action)),
        }
    }
}

// Global plugin manager instance
static mut GLOBAL_PLUGIN_MANAGER: Option<PluginManager> = None;

pub fn get_global_manager() -> &'static PluginManager {
    unsafe {
        GLOBAL_PLUGIN_MANAGER.get_or_insert_with(|| {
            PluginManager::new().expect("Failed to initialize plugin manager")
        })
    }
}

pub async fn list_available_plugins() -> Result<Vec<String>> {
    get_global_manager().list_available_plugins().await
}

pub async fn enable_plugin(plugin_name: String) -> Result<()> {
    get_global_manager().enable_plugin(plugin_name).await
}

pub async fn disable_plugin(plugin_name: String) -> Result<()> {
    get_global_manager().disable_plugin(plugin_name).await
} 