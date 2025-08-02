use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;
use std::time::{Duration, Instant};
use crate::AnalyticsData;

#[derive(Debug, Clone)]
pub struct SessionMetrics {
    pub start_time: Instant,
    pub connections_made: u32,
    pub data_transferred: u64,
    pub errors_encountered: u32,
    pub mouse_events_processed: u64,
    pub clipboard_shares: u32,
    pub hotkey_triggers: u32,
}

pub struct AnalyticsManager {
    session_data: Arc<Mutex<SessionMetrics>>,
    enabled: Arc<Mutex<bool>>,
}

impl AnalyticsManager {
    pub fn new() -> Self {
        Self {
            session_data: Arc::new(Mutex::new(SessionMetrics {
                start_time: Instant::now(),
                connections_made: 0,
                data_transferred: 0,
                errors_encountered: 0,
                mouse_events_processed: 0,
                clipboard_shares: 0,
                hotkey_triggers: 0,
            })),
            enabled: Arc::new(Mutex::new(true)),
        }
    }

    pub async fn record_connection(&self) {
        if *self.enabled.lock().await {
            let mut data = self.session_data.lock().await;
            data.connections_made += 1;
            log::debug!("Analytics: Connection recorded, total: {}", data.connections_made);
        }
    }

    pub async fn record_data_transfer(&self, bytes: u64) {
        if *self.enabled.lock().await {
            let mut data = self.session_data.lock().await;
            data.data_transferred += bytes;
            log::debug!("Analytics: Data transfer recorded, total: {} bytes", data.data_transferred);
        }
    }

    pub async fn record_error(&self) {
        if *self.enabled.lock().await {
            let mut data = self.session_data.lock().await;
            data.errors_encountered += 1;
            log::debug!("Analytics: Error recorded, total: {}", data.errors_encountered);
        }
    }

    pub async fn record_mouse_event(&self) {
        if *self.enabled.lock().await {
            let mut data = self.session_data.lock().await;
            data.mouse_events_processed += 1;
            if data.mouse_events_processed % 1000 == 0 {
                log::debug!("Analytics: {} mouse events processed", data.mouse_events_processed);
            }
        }
    }

    pub async fn record_clipboard_share(&self) {
        if *self.enabled.lock().await {
            let mut data = self.session_data.lock().await;
            data.clipboard_shares += 1;
            log::debug!("Analytics: Clipboard share recorded, total: {}", data.clipboard_shares);
        }
    }

    pub async fn record_hotkey_trigger(&self) {
        if *self.enabled.lock().await {
            let mut data = self.session_data.lock().await;
            data.hotkey_triggers += 1;
            log::debug!("Analytics: Hotkey trigger recorded, total: {}", data.hotkey_triggers);
        }
    }

    pub async fn get_session_data(&self) -> Result<AnalyticsData> {
        let data = self.session_data.lock().await;
        let duration = data.start_time.elapsed();
        
        Ok(AnalyticsData {
            session_duration: duration.as_secs(),
            connections_made: data.connections_made,
            data_transferred: data.data_transferred,
            errors_encountered: data.errors_encountered,
        })
    }

    pub async fn reset_session(&self) -> Result<()> {
        let mut data = self.session_data.lock().await;
        *data = SessionMetrics {
            start_time: Instant::now(),
            connections_made: 0,
            data_transferred: 0,
            errors_encountered: 0,
            mouse_events_processed: 0,
            clipboard_shares: 0,
            hotkey_triggers: 0,
        };
        log::info!("Analytics: Session data reset");
        Ok(())
    }

    pub async fn enable_analytics(&self, enable: bool) {
        *self.enabled.lock().await = enable;
        log::info!("Analytics {}", if enable { "enabled" } else { "disabled" });
    }

    pub async fn export_data(&self) -> Result<String> {
        let data = self.session_data.lock().await;
        let duration = data.start_time.elapsed();
        
        let report = format!(
            "MouseBridge Analytics Report\n\
             ===========================\n\
             Session Duration: {} seconds\n\
             Connections Made: {}\n\
             Data Transferred: {} bytes ({:.2} MB)\n\
             Errors Encountered: {}\n\
             Mouse Events Processed: {}\n\
             Clipboard Shares: {}\n\
             Hotkey Triggers: {}\n\
             Average Mouse Events/sec: {:.2}\n\
             Average Data Rate: {:.2} KB/s\n",
            duration.as_secs(),
            data.connections_made,
            data.data_transferred,
            data.data_transferred as f64 / 1024.0 / 1024.0,
            data.errors_encountered,
            data.mouse_events_processed,
            data.clipboard_shares,
            data.hotkey_triggers,
            if duration.as_secs() > 0 {
                data.mouse_events_processed as f64 / duration.as_secs() as f64
            } else {
                0.0
            },
            if duration.as_secs() > 0 {
                data.data_transferred as f64 / 1024.0 / duration.as_secs() as f64
            } else {
                0.0
            }
        );
        
        Ok(report)
    }

    pub async fn start_performance_monitoring(&self) -> Result<()> {
        let session_data = self.session_data.clone();
        let enabled = self.enabled.clone();

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(60)); // Every minute
            
            loop {
                interval.tick().await;
                
                if *enabled.lock().await {
                    let data = session_data.lock().await;
                    let duration = data.start_time.elapsed();
                    
                    if duration.as_secs() > 0 {
                        let events_per_sec = data.mouse_events_processed as f64 / duration.as_secs() as f64;
                        let data_rate = data.data_transferred as f64 / 1024.0 / duration.as_secs() as f64;
                        
                        log::info!(
                            "Performance: {:.2} events/sec, {:.2} KB/s, {} connections, {} errors",
                            events_per_sec,
                            data_rate,
                            data.connections_made,
                            data.errors_encountered
                        );
                    }
                }
            }
        });

        Ok(())
    }
}

// Global analytics manager instance
static mut GLOBAL_ANALYTICS_MANAGER: Option<AnalyticsManager> = None;

pub fn get_global_manager() -> &'static AnalyticsManager {
    unsafe {
        GLOBAL_ANALYTICS_MANAGER.get_or_insert_with(AnalyticsManager::new)
    }
}

pub async fn get_session_data() -> Result<AnalyticsData> {
    get_global_manager().get_session_data().await
}

pub async fn reset_session() -> Result<()> {
    get_global_manager().reset_session().await
}

pub async fn record_connection() {
    get_global_manager().record_connection().await;
}

pub async fn record_data_transfer(bytes: u64) {
    get_global_manager().record_data_transfer(bytes).await;
}

pub async fn record_error() {
    get_global_manager().record_error().await;
}

pub async fn record_mouse_event() {
    get_global_manager().record_mouse_event().await;
}

pub async fn record_clipboard_share() {
    get_global_manager().record_clipboard_share().await;
}

pub async fn record_hotkey_trigger() {
    get_global_manager().record_hotkey_trigger().await;
} 