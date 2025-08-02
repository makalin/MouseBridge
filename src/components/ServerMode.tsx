import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Play, Square, Copy, Wifi, Shield } from 'lucide-react';

interface ServerInfo {
  hostname: string;
  ip: string;
  port: number;
  fingerprint: string;
}

function ServerMode() {
  const [isRunning, setIsRunning] = useState(false);
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [port, setPort] = useState(4242);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if server is already running
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const status = await invoke<{ connected: boolean; mode: string }>('get_connection_status');
      setIsRunning(status.connected && status.mode === 'Server');
      
      if (isRunning) {
        const info = await invoke<ServerInfo>('get_server_info');
        setServerInfo(info);
      }
    } catch (error) {
      console.error('Failed to check server status:', error);
    }
  };

  const startServer = async () => {
    setLoading(true);
    try {
      await invoke('start_server', {
        config: {
          host: '0.0.0.0',
          port: port,
          protocol: 'WebRTC',
          timeout_ms: 5000,
        },
      });
      setIsRunning(true);
      await checkServerStatus();
    } catch (error) {
      console.error('Failed to start server:', error);
      alert('Failed to start server: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const stopServer = async () => {
    setLoading(true);
    try {
      await invoke('stop_server');
      setIsRunning(false);
      setServerInfo(null);
    } catch (error) {
      console.error('Failed to stop server:', error);
      alert('Failed to stop server: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Server Mode</h2>
          <div className="flex items-center space-x-2">
            <Wifi className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Share your mouse</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">
          Start the server to share your mouse with other devices. Other devices can connect to this computer using the connection information below.
        </p>

        {!isRunning ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-2">
                Port
              </label>
              <input
                id="port"
                type="number"
                value={port}
                onChange={(e) => setPort(parseInt(e.target.value) || 4242)}
                className="input w-32"
                min="1024"
                max="65535"
              />
            </div>
            
            <button
              onClick={startServer}
              disabled={loading}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>{loading ? 'Starting...' : 'Start Server'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Server Running</span>
            </div>
            
            {serverInfo && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hostname
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={serverInfo.hostname}
                        readOnly
                        className="input bg-gray-50"
                      />
                      <button
                        onClick={() => copyToClipboard(serverInfo.hostname)}
                        className="btn btn-secondary p-2"
                        title="Copy hostname"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IP Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={serverInfo.ip}
                        readOnly
                        className="input bg-gray-50"
                      />
                      <button
                        onClick={() => copyToClipboard(serverInfo.ip)}
                        className="btn btn-secondary p-2"
                        title="Copy IP address"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Port
                  </label>
                  <input
                    type="text"
                    value={serverInfo.port}
                    readOnly
                    className="input bg-gray-50 w-32"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Security Fingerprint
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={serverInfo.fingerprint}
                      readOnly
                      className="input bg-gray-50 font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(serverInfo.fingerprint)}
                      className="btn btn-secondary p-2"
                      title="Copy fingerprint"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use this fingerprint to verify the connection on the client device
                  </p>
                </div>
              </div>
            )}
            
            <button
              onClick={stopServer}
              disabled={loading}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Square className="h-4 w-4" />
              <span>{loading ? 'Stopping...' : 'Stop Server'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-5 w-5 text-gray-400" />
          <h3 className="text-md font-medium text-gray-900">Security Information</h3>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <p>• All connections are encrypted using WebRTC DTLS</p>
          <p>• Only authorized devices can connect to your server</p>
          <p>• Mouse movements are transmitted in real-time with minimal latency</p>
          <p>• No data is stored or logged on the server</p>
        </div>
      </div>
    </div>
  );
}

export default ServerMode; 