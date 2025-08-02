import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { getVersion } from '@tauri-apps/api/app';
import { Monitor, Settings, Wifi, WifiOff, Server, Monitor as MonitorIcon, Clipboard, Keyboard, BarChart3 } from 'lucide-react';
import ServerMode from './components/ServerMode';
import ClientMode from './components/ClientMode';
import SettingsPanel from './components/SettingsPanel';
import ClipboardPanel from './components/ClipboardPanel';
import HotkeysPanel from './components/HotkeysPanel';
import AnalyticsPanel from './components/AnalyticsPanel';

interface ConnectionStatus {
  connected: boolean;
  mode: string;
  remote_address?: string;
  latency_ms?: number;
}

interface PlatformInfo {
  os: string;
  arch: string;
  version: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'server' | 'client' | 'settings' | 'clipboard' | 'hotkeys' | 'analytics'>('server');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo | null>(null);
  const [appVersion, setAppVersion] = useState<string>('');

  useEffect(() => {
    // Get app version
    getVersion().then(setAppVersion);
    
    // Get platform info
    invoke<PlatformInfo>('get_platform_info').then(setPlatformInfo);
    
    // Start polling connection status
    const interval = setInterval(async () => {
      try {
        const status = await invoke<ConnectionStatus>('get_connection_status');
        setConnectionStatus(status);
      } catch (error) {
        console.error('Failed to get connection status:', error);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Monitor className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">MouseBridge</h1>
                <p className="text-sm text-gray-500">v{appVersion}</p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {connectionStatus?.connected ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm font-medium">Connected</span>
                  {connectionStatus.remote_address && (
                    <span className="text-xs text-gray-500">({connectionStatus.remote_address})</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-gray-500">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm">Disconnected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('server')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'server'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Server className="h-4 w-4 inline mr-2" />
              Server Mode
            </button>
            <button
              onClick={() => setActiveTab('client')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'client'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MonitorIcon className="h-4 w-4 inline mr-2" />
              Client Mode
            </button>
            <button
              onClick={() => setActiveTab('clipboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'clipboard'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clipboard className="h-4 w-4 inline mr-2" />
              Clipboard
            </button>
            <button
              onClick={() => setActiveTab('hotkeys')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'hotkeys'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Keyboard className="h-4 w-4 inline mr-2" />
              Hotkeys
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'server' && <ServerMode />}
        {activeTab === 'client' && <ClientMode />}
        {activeTab === 'clipboard' && <ClipboardPanel />}
        {activeTab === 'hotkeys' && <HotkeysPanel />}
        {activeTab === 'analytics' && <AnalyticsPanel />}
        {activeTab === 'settings' && <SettingsPanel platformInfo={platformInfo} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              {platformInfo && (
                <span>{platformInfo.os} {platformInfo.arch} • {platformInfo.version}</span>
              )}
            </div>
            <div>
              <a
                href="https://github.com/makalin/MouseBridge"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 