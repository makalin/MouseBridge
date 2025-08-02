use crate::{
    bridge::MouseBridgeService,
    config::Config,
    input::InputManager,
    network::{Client, Server},
    platform::get_platform,
};
use anyhow::Result;
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct ApplicationService {
    bridge_service: Arc<MouseBridgeService>,
    config: Arc<Mutex<Config>>,
    platform: Arc<dyn crate::platform::Platform>,
}

impl ApplicationService {
    pub fn new() -> Result<Arc<Self>> {
        let platform = get_platform();
        
        Ok(Arc::new(Self {
            bridge_service: MouseBridgeService::new(),
            config: Arc::new(Mutex::new(Config::default())),
            platform: Arc::from(platform),
        }))
    }

    pub async fn initialize(&self) -> Result<()> {
        // Load configuration
        let config = Config::load().await?;
        *self.config.lock().await = config;
        
        // Check platform permissions
        let has_permissions = self.platform.request_accessibility_permissions()?;
        if !has_permissions {
            return Err(anyhow::anyhow!("Accessibility permissions required"));
        }
        
        Ok(())
    }

    pub async fn get_bridge_service(&self) -> Arc<MouseBridgeService> {
        self.bridge_service.clone()
    }

    pub async fn get_config(&self) -> Config {
        self.config.lock().await.clone()
    }

    pub async fn update_config(&self, config: Config) -> Result<()> {
        config.save().await?;
        *self.config.lock().await = config;
        Ok(())
    }

    pub async fn get_platform_info(&self) -> Result<crate::platform::SystemInfo> {
        self.platform.get_system_info()
    }

    pub async fn get_screen_bounds(&self) -> Result<Vec<crate::platform::ScreenBounds>> {
        self.platform.get_screen_bounds()
    }
} 