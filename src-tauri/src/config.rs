use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub connection: ConnectionConfig,
    pub display: DisplayConfig,
    pub security: SecurityConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionConfig {
    pub host: String,
    pub port: u16,
    pub protocol: Protocol,
    pub timeout_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayConfig {
    pub screen_layout: ScreenLayout,
    pub transition_zone_pixels: u32,
    pub cursor_speed_multiplier: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityConfig {
    pub enable_encryption: bool,
    pub trusted_devices: Vec<String>,
    pub auto_accept_connections: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Protocol {
    WebRTC,
    UDP,
    TCP,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ScreenLayout {
    Horizontal,
    Vertical,
    Custom,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            connection: ConnectionConfig::default(),
            display: DisplayConfig::default(),
            security: SecurityConfig::default(),
        }
    }
}

impl Default for ConnectionConfig {
    fn default() -> Self {
        Self {
            host: "127.0.0.1".to_string(),
            port: 4242,
            protocol: Protocol::WebRTC,
            timeout_ms: 5000,
        }
    }
}

impl Default for DisplayConfig {
    fn default() -> Self {
        Self {
            screen_layout: ScreenLayout::Horizontal,
            transition_zone_pixels: 10,
            cursor_speed_multiplier: 1.0,
        }
    }
}

impl Default for SecurityConfig {
    fn default() -> Self {
        Self {
            enable_encryption: true,
            trusted_devices: Vec::new(),
            auto_accept_connections: false,
        }
    }
}

impl Config {
    pub async fn load() -> Result<Self> {
        let config_path = Self::get_config_path()?;
        
        if config_path.exists() {
            let content = tokio::fs::read_to_string(config_path).await?;
            let config: Config = serde_json::from_str(&content)?;
            Ok(config)
        } else {
            let config = Config::default();
            config.save().await?;
            Ok(config)
        }
    }

    pub async fn save(&self) -> Result<()> {
        let config_path = Self::get_config_path()?;
        
        // Ensure config directory exists
        if let Some(parent) = config_path.parent() {
            tokio::fs::create_dir_all(parent).await?;
        }
        
        let content = serde_json::to_string_pretty(self)?;
        tokio::fs::write(config_path, content).await?;
        
        Ok(())
    }

    fn get_config_path() -> Result<PathBuf> {
        let config_dir = dirs::config_dir()
            .ok_or_else(|| anyhow::anyhow!("Could not determine config directory"))?
            .join("mousebridge");
        
        Ok(config_dir.join("config.json"))
    }
} 