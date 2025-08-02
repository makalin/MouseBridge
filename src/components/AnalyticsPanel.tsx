import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { BarChart3, Download, RefreshCw, Activity, Clock, Wifi, AlertTriangle } from 'lucide-react';

interface AnalyticsData {
  session_duration: number;
  connections_made: number;
  data_transferred: number;
  errors_encountered: number;
}

function AnalyticsPanel() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
    
    if (autoRefresh) {
      const interval = setInterval(loadAnalyticsData, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const data = await invoke<AnalyticsData>('get_analytics_data');
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetAnalytics = async () => {
    setLoading(true);
    try {
      await invoke('reset_analytics');
      await loadAnalyticsData();
    } catch (error) {
      console.error('Failed to reset analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      // This would trigger a file download in a real implementation
      console.log('Exporting analytics report...');
      // await invoke('export_analytics_report');
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getDataRate = (): string => {
    if (!analyticsData) return '0 KB/s';
    
    const rate = analyticsData.data_transferred / Math.max(analyticsData.session_duration, 1);
    return formatBytes(rate as number) + '/s';
  };

  const getConnectionRate = (): string => {
    if (!analyticsData) return '0/min';
    
    const rate = analyticsData.connections_made / Math.max(analyticsData.session_duration / 60, 1);
    return `${rate.toFixed(2)}/min`;
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Analytics & Monitoring</h2>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Performance metrics</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={loadAnalyticsData}
              disabled={loading}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={resetAnalytics}
              disabled={loading}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Activity className="h-4 w-4" />
              <span>Reset</span>
            </button>
            
            <button
              onClick={exportReport}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              id="auto-refresh"
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="auto-refresh" className="text-sm text-gray-700">
              Auto-refresh
            </label>
          </div>
        </div>

        {/* Analytics Data */}
        {loading && !analyticsData ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading analytics...</p>
          </div>
        ) : analyticsData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Session Duration */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Session Duration</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {formatDuration(analyticsData.session_duration)}
              </div>
            </div>

            {/* Connections Made */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Wifi className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Connections</span>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {analyticsData.connections_made}
              </div>
              <div className="text-xs text-green-600">
                {getConnectionRate()}
              </div>
            </div>

            {/* Data Transferred */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Data Transferred</span>
              </div>
              <div className="text-2xl font-bold text-purple-700">
                {formatBytes(analyticsData.data_transferred)}
              </div>
              <div className="text-xs text-purple-600">
                {getDataRate()}
              </div>
            </div>

            {/* Errors */}
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-900">Errors</span>
              </div>
              <div className="text-2xl font-bold text-red-700">
                {analyticsData.errors_encountered}
              </div>
              <div className="text-xs text-red-600">
                {analyticsData.session_duration > 0 
                  ? `${(analyticsData.errors_encountered / (analyticsData.session_duration / 3600)).toFixed(2)}/hour`
                  : '0/hour'
                }
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No analytics data available
          </div>
        )}
      </div>

      {/* Performance Charts */}
      <div className="card">
        <h3 className="text-md font-medium text-gray-900 mb-4">Performance Trends</h3>
        
        <div className="space-y-4">
          {/* Data Transfer Rate Chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Data Transfer Rate</span>
              <span className="text-sm text-gray-500">{getDataRate()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((analyticsData?.data_transferred || 0) / 1024 / 1024, 100)}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Connection Success Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Connection Success Rate</span>
              <span className="text-sm text-gray-500">
                {analyticsData && analyticsData.connections_made > 0
                  ? `${((analyticsData.connections_made - analyticsData.errors_encountered) / analyticsData.connections_made * 100).toFixed(1)}%`
                  : '100%'
                }
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${analyticsData && analyticsData.connections_made > 0
                    ? ((analyticsData.connections_made - analyticsData.errors_encountered) / analyticsData.connections_made * 100)
                    : 100
                  }%` 
                }}
              ></div>
            </div>
          </div>

          {/* Error Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Error Rate</span>
              <span className="text-sm text-gray-500">
                {analyticsData && analyticsData.session_duration > 0
                  ? `${(analyticsData.errors_encountered / (analyticsData.session_duration / 3600)).toFixed(2)}/hour`
                  : '0/hour'
                }
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((analyticsData?.errors_encountered || 0) * 10, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="card">
        <h3 className="text-md font-medium text-gray-900 mb-3">About Analytics</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Analytics data is collected locally and not shared</p>
          <p>• Data includes session duration, connections, and performance metrics</p>
          <p>• Error tracking helps identify connection issues</p>
          <p>• Data transfer rates show network performance</p>
          <p>• You can reset analytics data at any time</p>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPanel; 