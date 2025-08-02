pub mod bridge;
pub mod config;
pub mod input;
pub mod network;
pub mod platform;
pub mod service;
pub mod clipboard;
pub mod hotkeys;
pub mod analytics;
pub mod plugins;

use bridge::MouseBridgeService;
use config::{Config, ConnectionConfig};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct ServerInfo {
    pub hostname: String,
    pub ip: String,
    pub port: u16,
    pub fingerprint: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConnectionStatus {
    pub connected: bool,
    pub mode: String,
    pub remote_address: Option<String>,
    pub latency_ms: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PlatformInfo {
    pub os: String,
    pub arch: String,
    pub version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ClipboardData {
    pub text: Option<String>,
    pub image: Option<Vec<u8>>,
    pub files: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HotkeyConfig {
    pub key: String,
    pub modifiers: Vec<String>,
    pub action: String,
    pub enabled: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalyticsData {
    pub session_duration: u64,
    pub connections_made: u32,
    pub data_transferred: u64,
    pub errors_encountered: u32,
} 