import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Play, Square, Monitor, Shield, AlertCircle } from 'lucide-react';

function ClientMode() {
  const [isConnected, setIsConnected] = useState(false);
  const [host, setHost] = useState('');
  const [port, setPort] = useState(4242);
  const [fingerprint, setFingerprint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if client is already connected
    checkClientStatus();
  }, []);

  const checkClientStatus = async () => {
    try {
      const status = await invoke<{ connected: boolean; mode: string }>('get_connection_status');
      setIsConnected(status.connected && status.mode === 'Client');
    } catch (error) {
      console.error('Failed to check client status:', error);
    }
  };

  const connectToServer = async () => {
    if (!host.trim()) {
      setError('Please enter a host address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await invoke('connect_client', {
        config: {
          host: host.trim(),
          port: port,
          protocol: 'WebRTC',
          timeout_ms: 5000,
        },
      });
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect to server:', error);
      setError('Failed to connect: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectFromServer = async () => {
    setLoading(true);
    try {
      await invoke('disconnect_client');
      setIsConnected(false);
      setError('');
    } catch (error) {
      console.error('Failed to disconnect from server:', error);
      setError('Failed to disconnect: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Client Mode</h2>
          <div className="flex items-center space-x-2">
            <Monitor className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Connect to server</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">
          Connect to a MouseBridge server to control this computer with a mouse from another device.
        </p>

        {!isConnected ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="host" className="block text-sm font-medium text-gray-700 mb-2">
                Server Address
              </label>
              <input
                id="host"
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="192.168.1.100 or hostname"
                className="input"
              />
            </div>
            
            <div>
              <label htmlFor="client-port" className="block text-sm font-medium text-gray-700 mb-2">
                Port
              </label>
              <input
                id="client-port"
                type="number"
                value={port}
                onChange={(e) => setPort(parseInt(e.target.value) || 4242)}
                className="input w-32"
                min="1024"
                max="65535"
              />
            </div>
            
            <div>
              <label htmlFor="fingerprint" className="block text-sm font-medium text-gray-700 mb-2">
                Security Fingerprint (Optional)
              </label>
              <input
                id="fingerprint"
                type="text"
                value={fingerprint}
                onChange={(e) => setFingerprint(e.target.value)}
                placeholder="Enter server fingerprint for verification"
                className="input font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the fingerprint from the server to verify the connection
              </p>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <button
              onClick={connectToServer}
              disabled={loading}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>{loading ? 'Connecting...' : 'Connect to Server'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Connected to Server</span>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                You are now connected to the server. Move your mouse to the edge of the server's screen to control this computer.
              </p>
            </div>
            
            <button
              onClick={disconnectFromServer}
              disabled={loading}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Square className="h-4 w-4" />
              <span>{loading ? 'Disconnecting...' : 'Disconnect'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-5 w-5 text-gray-400" />
          <h3 className="text-md font-medium text-gray-900">Connection Security</h3>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Verify the server fingerprint to ensure you're connecting to the right device</p>
          <p>• All communication is encrypted using WebRTC DTLS</p>
          <p>• Only accept connections from trusted servers</p>
          <p>• Disconnect immediately if you notice suspicious behavior</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-md font-medium text-gray-900 mb-4">How to Use</h3>
        
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
              1
            </div>
            <p>Start MouseBridge on the computer that has the mouse you want to share (Server Mode)</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
              2
            </div>
            <p>Note the server's IP address, port, and security fingerprint</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
              3
            </div>
            <p>On this computer, enter the server details and connect (Client Mode)</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
              4
            </div>
            <p>Move your mouse to the edge of the server's screen to control this computer</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientMode; 