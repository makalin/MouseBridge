import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Clipboard, Copy, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';

interface ClipboardData {
  text?: string;
  image?: number[];
  files?: string[];
}

function ClipboardPanel() {
  const [clipboardContent, setClipboardContent] = useState<ClipboardData | null>(null);
  const [sharingEnabled, setSharingEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ClipboardData[]>([]);

  useEffect(() => {
    loadClipboardContent();
    const interval = setInterval(loadClipboardContent, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadClipboardContent = async () => {
    try {
      const content = await invoke<ClipboardData>('get_clipboard_content');
      setClipboardContent(content);
      
      // Add to history if it's new content
      if (content.text && content.text !== clipboardContent?.text) {
        setHistory(prev => [content, ...prev.slice(0, 9)]); // Keep last 10 items
      }
    } catch (error) {
      console.error('Failed to load clipboard content:', error);
    }
  };

  const updateClipboardContent = async (content: ClipboardData) => {
    setLoading(true);
    try {
      await invoke('set_clipboard_content', { data: content });
      await loadClipboardContent();
    } catch (error) {
      console.error('Failed to set clipboard content:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSharing = async () => {
    setLoading(true);
    try {
      await invoke('enable_clipboard_sharing', { enable: !sharingEnabled });
      setSharingEnabled(!sharingEnabled);
    } catch (error) {
      console.error('Failed to toggle clipboard sharing:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Clipboard Management</h2>
          <div className="flex items-center space-x-2">
            <Clipboard className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Share clipboard content</span>
          </div>
        </div>

        {/* Clipboard Sharing Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-md font-medium text-gray-900">Clipboard Sharing</h3>
            <p className="text-sm text-gray-500">
              Automatically sync clipboard content between connected devices
            </p>
          </div>
          <button
            onClick={toggleSharing}
            disabled={loading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              sharingEnabled
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {sharingEnabled ? (
              <>
                <ToggleRight className="h-4 w-4" />
                <span>Enabled</span>
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4" />
                <span>Disabled</span>
              </>
            )}
          </button>
        </div>

        {/* Current Clipboard Content */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-3">Current Content</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {clipboardContent?.text ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Text</span>
                  <button
                    onClick={() => copyToClipboard(clipboardContent.text!)}
                    className="btn btn-secondary p-1"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                <div className="bg-white rounded border p-3 text-sm text-gray-800 font-mono break-all">
                  {clipboardContent.text}
                </div>
              </div>
            ) : clipboardContent?.image ? (
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Image</span>
                <div className="bg-white rounded border p-3 text-sm text-gray-500">
                  Image data available ({clipboardContent.image.length} bytes)
                </div>
              </div>
            ) : clipboardContent?.files ? (
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Files</span>
                <div className="bg-white rounded border p-3">
                  {clipboardContent.files.map((file, index) => (
                    <div key={index} className="text-sm text-gray-800">
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No content in clipboard</div>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={loadClipboardContent}
          disabled={loading}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Clipboard History */}
      {history.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium text-gray-900">Clipboard History</h3>
            <button
              onClick={clearHistory}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear History
            </button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded p-3">
                {item.text ? (
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-800 truncate">
                        {item.text}
                      </div>
                    </div>
                    <button
                      onClick={() => updateClipboardContent(item)}
                      className="ml-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Restore
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    {item.image ? 'Image' : item.files ? 'Files' : 'Unknown content'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information */}
      <div className="card">
        <h3 className="text-md font-medium text-gray-900 mb-3">About Clipboard Sharing</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Clipboard content is automatically synchronized between connected devices</p>
          <p>• Text, images, and files are supported</p>
          <p>• Content is encrypted during transmission</p>
          <p>• History is stored locally and not shared</p>
          <p>• You can disable sharing at any time</p>
        </div>
      </div>
    </div>
  );
}

export default ClipboardPanel; 