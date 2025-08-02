use anyhow::Result;
use device_query::{DeviceQuery, DeviceState, MouseState};
use enigo::{Enigo, MouseButton, MouseControllable};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MouseEvent {
    pub x: i32,
    pub y: i32,
    pub button: Option<String>, // Use string instead of MouseButton for serialization
    pub pressed: bool,
    pub wheel_x: i32,
    pub wheel_y: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyboardEvent {
    pub key: String,
    pub pressed: bool,
    pub modifiers: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InputConfig {
    pub cursor_speed: f32,
    pub mouse_acceleration: bool,
    pub acceleration_sensitivity: f32,
    pub cursor_locked: bool,
    pub locked_screen: Option<u32>,
    pub gesture_enabled: bool,
    pub gesture_sensitivity: f32,
}

#[derive(Debug, Clone)]
pub struct GestureTracker {
    pub points: Vec<(i32, i32)>,
    pub start_time: std::time::Instant,
    pub is_active: bool,
}

impl GestureTracker {
    pub fn new() -> Self {
        Self {
            points: Vec::new(),
            start_time: std::time::Instant::now(),
            is_active: false,
        }
    }

    pub fn add_point(&mut self, x: i32, y: i32) {
        self.points.push((x, y));
        if self.points.len() > 100 {
            self.points.remove(0);
        }
    }

    pub fn detect_gesture(&self) -> Option<String> {
        if self.points.len() < 5 {
            return None;
        }

        let duration = self.start_time.elapsed();
        if duration.as_millis() < 500 {
            return None;
        }

        // Simple gesture detection
        let dx = self.points.last().unwrap().0 - self.points.first().unwrap().0;
        let dy = self.points.last().unwrap().1 - self.points.first().unwrap().1;
        let distance = ((dx * dx + dy * dy) as f64).sqrt();

        if distance < 50.0 {
            return None;
        }

        let angle = (dy as f64).atan2(dx as f64) * 180.0 / std::f64::consts::PI;

        match angle {
            -45.0..=45.0 => Some("right".to_string()),
            45.0..=135.0 => Some("down".to_string()),
            135.0..=180.0 | -180.0..=-135.0 => Some("left".to_string()),
            -135.0..=-45.0 => Some("up".to_string()),
            _ => None,
        }
    }

    pub fn reset(&mut self) {
        self.points.clear();
        self.start_time = std::time::Instant::now();
        self.is_active = false;
    }
}

pub struct InputManager {
    device_state: Arc<DeviceState>,
    last_mouse_state: Arc<Mutex<MouseState>>,
    config: Arc<Mutex<InputConfig>>,
    gesture_tracker: Arc<Mutex<GestureTracker>>,
}

impl InputManager {
    pub fn new() -> Self {
        Self {
            device_state: Arc::new(DeviceState::new()),
            last_mouse_state: Arc::new(Mutex::new(MouseState::default())),
            config: Arc::new(Mutex::new(InputConfig {
                cursor_speed: 1.0,
                mouse_acceleration: false,
                acceleration_sensitivity: 1.0,
                cursor_locked: false,
                locked_screen: None,
                gesture_enabled: false,
                gesture_sensitivity: 1.0,
            })),
            gesture_tracker: Arc::new(Mutex::new(GestureTracker::new())),
        }
    }

    pub async fn capture_mouse_events(&self) -> Result<Vec<MouseEvent>> {
        let current_mouse = self.device_state.get_mouse();
        let mut last_mouse = self.last_mouse_state.lock().await;
        
        let mut events = Vec::new();
        
        // Check for mouse movement
        if current_mouse.coords != last_mouse.coords {
            events.push(MouseEvent {
                x: current_mouse.coords.0,
                y: current_mouse.coords.1,
                button: None,
                pressed: false,
                wheel_x: 0,
                wheel_y: 0,
            });
        }
        
        // Check for button changes
        for (i, &pressed) in current_mouse.button_pressed.iter().enumerate() {
            let last_pressed = last_mouse.button_pressed.get(i).copied().unwrap_or(false);
            
            if pressed != last_pressed {
                let button = match i {
                    0 => Some("left".to_string()),
                    1 => Some("right".to_string()),
                    2 => Some("middle".to_string()),
                    _ => None,
                };
                
                if let Some(btn) = button {
                    events.push(MouseEvent {
                        x: current_mouse.coords.0,
                        y: current_mouse.coords.1,
                        button: Some(btn),
                        pressed,
                        wheel_x: 0,
                        wheel_y: 0,
                    });
                }
            }
        }
        
        // Note: device_query MouseState doesn't have scroll field in current version
        // Wheel events would need to be handled differently
        
        *last_mouse = current_mouse.clone();
        Ok(events)
    }

    pub async fn emulate_mouse_event(&self, event: MouseEvent) -> Result<()> {
        // Create a new Enigo instance for this operation (not shared between threads)
        let mut enigo = Enigo::new();
        
        // Move mouse
        enigo.mouse_move_to(event.x, event.y);
        
        // Handle button events
        if let Some(button_str) = &event.button {
            let button = match button_str.as_str() {
                "left" => MouseButton::Left,
                "right" => MouseButton::Right,
                "middle" => MouseButton::Middle,
                _ => return Ok(()), // Skip unknown button types
            };
            if event.pressed {
                enigo.mouse_down(button);
            } else {
                enigo.mouse_up(button);
            }
        }
        
        // Handle wheel events
        if event.wheel_x != 0 {
            enigo.mouse_scroll_x(event.wheel_x);
        }
        if event.wheel_y != 0 {
            enigo.mouse_scroll_y(event.wheel_y);
        }
        
        Ok(())
    }

    pub async fn get_mouse_position(&self) -> Result<(i32, i32)> {
        let mouse = self.device_state.get_mouse();
        Ok(mouse.coords)
    }

    pub async fn set_mouse_position(&self, x: i32, y: i32) -> Result<()> {
        // Create a new Enigo instance for this operation (not shared between threads)
        let mut enigo = Enigo::new();
        enigo.mouse_move_to(x, y);
        Ok(())
    }

    pub async fn get_screen_bounds(&self) -> Result<Vec<ScreenBounds>> {
        // This would need platform-specific implementation
        // For now, return a default single screen
        Ok(vec![ScreenBounds {
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
            primary: true,
        }])
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScreenBounds {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub primary: bool,
}

// Global input manager instance
static mut GLOBAL_INPUT_MANAGER: Option<InputManager> = None;

pub fn get_global_manager() -> &'static InputManager {
    unsafe {
        GLOBAL_INPUT_MANAGER.get_or_insert_with(InputManager::new)
    }
}

// Functions called from lib.rs
pub async fn lock_cursor_to_screen(screen_index: u32) -> Result<()> {
    let mut config = get_global_manager().config.lock().await;
    config.cursor_locked = true;
    config.locked_screen = Some(screen_index);
    log::info!("Cursor locked to screen {}", screen_index);
    Ok(())
}

pub async fn unlock_cursor() -> Result<()> {
    let mut config = get_global_manager().config.lock().await;
    config.cursor_locked = false;
    config.locked_screen = None;
    log::info!("Cursor unlocked");
    Ok(())
}

pub async fn set_cursor_speed(speed: f32) -> Result<()> {
    let mut config = get_global_manager().config.lock().await;
    config.cursor_speed = speed.max(0.1).min(5.0);
    log::info!("Cursor speed set to {}", config.cursor_speed);
    Ok(())
}

pub async fn enable_mouse_acceleration(enable: bool) -> Result<()> {
    let mut config = get_global_manager().config.lock().await;
    config.mouse_acceleration = enable;
    log::info!("Mouse acceleration {}", if enable { "enabled" } else { "disabled" });
    Ok(())
} 