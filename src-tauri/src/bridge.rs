use crate::{
    config::ConnectionConfig,
    input::InputManager,
    network::{Client, Server, ServerHandle, ClientHandle},
};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BridgeMode {
    Server,
    Client,
    Disconnected,
}

pub struct MouseBridgeService {
    mode: Arc<Mutex<BridgeMode>>,
    server: Arc<Mutex<Option<ServerHandle>>>,
    client: Arc<Mutex<Option<ClientHandle>>>,
    input_manager: Arc<InputManager>,
    config: Arc<Mutex<ConnectionConfig>>,
    server_info: Arc<Mutex<Option<ServerInfo>>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerInfo {
    pub hostname: String,
    pub ip: String,
    pub port: u16,
    pub fingerprint: String,
}

impl MouseBridgeService {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            mode: Arc::new(Mutex::new(BridgeMode::Disconnected)),
            server: Arc::new(Mutex::new(None)),
            client: Arc::new(Mutex::new(None)),
            input_manager: Arc::new(InputManager::new()),
            config: Arc::new(Mutex::new(ConnectionConfig::default())),
            server_info: Arc::new(Mutex::new(None)),
        })
    }

    pub async fn start_server(&self, config: ConnectionConfig) -> Result<()> {
        let mut mode = self.mode.lock().await;
        if matches!(*mode, BridgeMode::Server) {
            return Ok(());
        }

        // Stop any existing connections
        self.stop_server().await?;
        self.disconnect_client().await?;

        // Create server info
        let server_info = ServerInfo {
            hostname: hostname::get()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string(),
            ip: local_ipaddress::get().unwrap_or_else(|| "127.0.0.1".to_string()),
            port: config.port,
            fingerprint: Uuid::new_v4().to_string(),
        };

        // Start server
        let server = Server::new(config.clone(), self.input_manager.clone()).await?;
        let server_handle = server.start().await?;

        // Update state
        *mode = BridgeMode::Server;
        *self.config.lock().await = config;
        *self.server.lock().await = Some(server_handle);
        *self.server_info.lock().await = Some(server_info);

        Ok(())
    }

    pub async fn stop_server(&self) -> Result<()> {
        let mut mode = self.mode.lock().await;
        if !matches!(*mode, BridgeMode::Server) {
            return Ok(());
        }

        // Stop server
        if let Some(server) = self.server.lock().await.take() {
            server.stop().await?;
        }

        // Update state
        *mode = BridgeMode::Disconnected;
        *self.server_info.lock().await = None;

        Ok(())
    }

    pub async fn connect_client(&self, config: ConnectionConfig) -> Result<()> {
        let mut mode = self.mode.lock().await;
        if matches!(*mode, BridgeMode::Client) {
            return Ok(());
        }

        // Stop any existing connections
        self.stop_server().await?;
        self.disconnect_client().await?;

        // Start client
        let client = Client::new(config.clone(), self.input_manager.clone()).await?;
        let client_handle = client.connect().await?;

        // Update state
        *mode = BridgeMode::Client;
        *self.config.lock().await = config;
        *self.client.lock().await = Some(client_handle);

        Ok(())
    }

    pub async fn disconnect_client(&self) -> Result<()> {
        let mut mode = self.mode.lock().await;
        if !matches!(*mode, BridgeMode::Client) {
            return Ok(());
        }

        // Stop client
        if let Some(client) = self.client.lock().await.take() {
            client.disconnect().await?;
        }

        // Update state
        *mode = BridgeMode::Disconnected;

        Ok(())
    }

    pub async fn get_connection_status(&self) -> Result<crate::ConnectionStatus> {
        let mode = self.mode.lock().await;
        let config = self.config.lock().await;

        Ok(crate::ConnectionStatus {
            connected: !matches!(*mode, BridgeMode::Disconnected),
            mode: format!("{:?}", *mode),
            remote_address: match *mode {
                BridgeMode::Client => Some(format!("{}:{}", config.host, config.port)),
                _ => None,
            },
            latency_ms: None, // TODO: Implement latency measurement
        })
    }

    pub async fn get_server_info(&self) -> Result<crate::ServerInfo> {
        let server_info = self.server_info.lock().await;
        server_info
            .as_ref()
            .map(|info| crate::ServerInfo {
                hostname: info.hostname.clone(),
                ip: info.ip.clone(),
                port: info.port,
                fingerprint: info.fingerprint.clone(),
            })
            .ok_or_else(|| anyhow::anyhow!("Server not running"))
    }
} 