import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Settings, Monitor, Shield, Save, RefreshCw } from 'lucide-react';

interface PlatformInfo {
  os: string;
  arch: string;
  version: string;
}

interface Config {
  connection: {
    host: string;
    port: number;
    protocol: string;
    timeout_ms: number;
  };
  display: {
    screen_layout: string;
    transition_zone_pixels: number;
    cursor_speed_multiplier: number;
  };
  security: {
    enable_encryption: boolean;
    trusted_devices: string[];
    auto_accept_connections: boolean;
  };
}

interface SettingsPanelProps {
  platformInfo: PlatformInfo | null;
}

function SettingsPanel({ platformInfo }: SettingsPanelProps) {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const loadedConfig = await invoke<Config>('load_config');
      setConfig(loadedConfig);
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    
    setLoading(true);
    try {
      await invoke('save_config', { config });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (updates: Partial<Config>) => {
    if (config) {
      setConfig({ ...config, ...updates });
    }
  };

  if (!config) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-500">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Settings */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="h-5 w-5 text-gray-400" />
          <h3 className="text-md font-medium text-gray-900">Connection Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Host
            </label>
            <input
              type="text"
              value={config.connection.host}
              onChange={(e) => updateConfig({
                connection: { ...config.connection, host: e.target.value }
              })}
              className="input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Port
            </label>
            <input
              type="number"
              value={config.connection.port}
              onChange={(e) => updateConfig({
                connection: { ...config.connection, port: parseInt(e.target.value) || 4242 }
              })}
              className="input"
              min="1024"
              max="65535"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Connection Timeout (ms)
            </label>
            <input
              type="number"
              value={config.connection.timeout_ms}
              onChange={(e) => updateConfig({
                connection: { ...config.connection, timeout_ms: parseInt(e.target.value) || 5000 }
              })}
              className="input"
              min="1000"
              max="30000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Protocol
            </label>
            <select
              value={config.connection.protocol}
              onChange={(e) => updateConfig({
                connection: { ...config.connection, protocol: e.target.value }
              })}
              className="input"
            >
              <option value="WebRTC">WebRTC</option>
              <option value="UDP">UDP</option>
              <option value="TCP">TCP</option>
            </select>
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Monitor className="h-5 w-5 text-gray-400" />
          <h3 className="text-md font-medium text-gray-900">Display Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Screen Layout
            </label>
            <select
              value={config.display.screen_layout}
              onChange={(e) => updateConfig({
                display: { ...config.display, screen_layout: e.target.value }
              })}
              className="input"
            >
              <option value="Horizontal">Horizontal</option>
              <option value="Vertical">Vertical</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transition Zone (pixels)
            </label>
            <input
              type="number"
              value={config.display.transition_zone_pixels}
              onChange={(e) => updateConfig({
                display: { ...config.display, transition_zone_pixels: parseInt(e.target.value) || 10 }
              })}
              className="input"
              min="1"
              max="100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cursor Speed Multiplier
            </label>
            <input
              type="number"
              step="0.1"
              value={config.display.cursor_speed_multiplier}
              onChange={(e) => updateConfig({
                display: { ...config.display, cursor_speed_multiplier: parseFloat(e.target.value) || 1.0 }
              })}
              className="input"
              min="0.1"
              max="5.0"
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-5 w-5 text-gray-400" />
          <h3 className="text-md font-medium text-gray-900">Security Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="enable-encryption"
              type="checkbox"
              checked={config.security.enable_encryption}
              onChange={(e) => updateConfig({
                security: { ...config.security, enable_encryption: e.target.checked }
              })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="enable-encryption" className="ml-2 block text-sm text-gray-900">
              Enable encryption (WebRTC DTLS)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="auto-accept"
              type="checkbox"
              checked={config.security.auto_accept_connections}
              onChange={(e) => updateConfig({
                security: { ...config.security, auto_accept_connections: e.target.checked }
              })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="auto-accept" className="ml-2 block text-sm text-gray-900">
              Auto-accept connections from trusted devices
            </label>
          </div>
        </div>
      </div>

      {/* System Information */}
      {platformInfo && (
        <div className="card">
          <h3 className="text-md font-medium text-gray-900 mb-4">System Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Operating System:</span>
              <p className="font-medium">{platformInfo.os}</p>
            </div>
            <div>
              <span className="text-gray-500">Architecture:</span>
              <p className="font-medium">{platformInfo.arch}</p>
            </div>
            <div>
              <span className="text-gray-500">Version:</span>
              <p className="font-medium">{platformInfo.version}</p>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveConfig}
          disabled={loading}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>
            {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
          </span>
        </button>
      </div>
    </div>
  );
}

export default SettingsPanel; 