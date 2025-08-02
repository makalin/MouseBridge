import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Keyboard, Plus, Trash2, Edit3, Save, X } from 'lucide-react';

interface HotkeyConfig {
  key: string;
  modifiers: string[];
  action: string;
  enabled: boolean;
}

function HotkeysPanel() {
  const [hotkeys, setHotkeys] = useState<HotkeyConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newHotkey, setNewHotkey] = useState<HotkeyConfig>({
    key: '',
    modifiers: [],
    action: '',
    enabled: true,
  });

  const availableActions = [
    { value: 'lock_cursor', label: 'Lock Cursor to Screen' },
    { value: 'unlock_cursor', label: 'Unlock Cursor' },
    { value: 'toggle_connection', label: 'Toggle Connection' },
    { value: 'switch_screen', label: 'Switch Screen' },
    { value: 'emergency_disconnect', label: 'Emergency Disconnect' },
    { value: 'enable_clipboard', label: 'Enable Clipboard Sharing' },
    { value: 'disable_clipboard', label: 'Disable Clipboard Sharing' },
    { value: 'show_analytics', label: 'Show Analytics' },
  ];

  const availableModifiers = ['Ctrl', 'Alt', 'Shift', 'Cmd', 'Super'];

  useEffect(() => {
    loadHotkeys();
  }, []);

  const loadHotkeys = async () => {
    setLoading(true);
    try {
      const registeredHotkeys = await invoke<HotkeyConfig[]>('get_registered_hotkeys');
      setHotkeys(registeredHotkeys);
    } catch (error) {
      console.error('Failed to load hotkeys:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerHotkey = async (hotkey: HotkeyConfig) => {
    setLoading(true);
    try {
      await invoke('register_hotkey', { config: hotkey });
      await loadHotkeys();
      setNewHotkey({ key: '', modifiers: [], action: '', enabled: true });
    } catch (error) {
      console.error('Failed to register hotkey:', error);
    } finally {
      setLoading(false);
    }
  };

  const unregisterHotkey = async (key: string) => {
    setLoading(true);
    try {
      await invoke('unregister_hotkey', { key });
      await loadHotkeys();
    } catch (error) {
      console.error('Failed to unregister hotkey:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateHotkey = async (index: number, hotkey: HotkeyConfig) => {
    setLoading(true);
    try {
      // Unregister old hotkey
      const oldHotkey = hotkeys[index];
      await invoke('unregister_hotkey', { key: formatHotkeyString(oldHotkey) });
      
      // Register new hotkey
      await invoke('register_hotkey', { config: hotkey });
      await loadHotkeys();
      setEditingIndex(null);
    } catch (error) {
      console.error('Failed to update hotkey:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatHotkeyString = (hotkey: HotkeyConfig): string => {
    return `${hotkey.modifiers.join('+')}+${hotkey.key}`;
  };

  const getActionLabel = (action: string): string => {
    const found = availableActions.find(a => a.value === action);
    return found ? found.label : action;
  };

  const handleAddHotkey = () => {
    if (newHotkey.key && newHotkey.action) {
      registerHotkey(newHotkey);
    }
  };

  const handleEditHotkey = (index: number) => {
    setEditingIndex(index);
    setNewHotkey(hotkeys[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && newHotkey.key && newHotkey.action) {
      updateHotkey(editingIndex, newHotkey);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewHotkey({ key: '', modifiers: [], action: '', enabled: true });
  };

  const toggleModifier = (modifier: string) => {
    setNewHotkey(prev => ({
      ...prev,
      modifiers: prev.modifiers.includes(modifier)
        ? prev.modifiers.filter(m => m !== modifier)
        : [...prev.modifiers, modifier],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Hotkey Management</h2>
          <div className="flex items-center space-x-2">
            <Keyboard className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Customize shortcuts</span>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          Configure keyboard shortcuts for quick access to MouseBridge features.
        </p>

        {/* Add New Hotkey */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">Add New Hotkey</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key
              </label>
              <input
                type="text"
                value={newHotkey.key}
                onChange={(e) => setNewHotkey(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
                placeholder="A, B, C, F1, F2..."
                className="input"
                maxLength={2}
              />
            </div>

            {/* Action */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <select
                value={newHotkey.action}
                onChange={(e) => setNewHotkey(prev => ({ ...prev, action: e.target.value }))}
                className="input"
              >
                <option value="">Select an action</option>
                {availableActions.map(action => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Modifiers */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modifiers
            </label>
            <div className="flex flex-wrap gap-2">
              {availableModifiers.map(modifier => (
                <button
                  key={modifier}
                  onClick={() => toggleModifier(modifier)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    newHotkey.modifiers.includes(modifier)
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {modifier}
                </button>
              ))}
            </div>
          </div>

          {/* Add Button */}
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleAddHotkey}
              disabled={loading || !newHotkey.key || !newHotkey.action}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Hotkey</span>
            </button>
          </div>
        </div>

        {/* Registered Hotkeys */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4">Registered Hotkeys</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading hotkeys...</p>
            </div>
          ) : hotkeys.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hotkeys registered yet
            </div>
          ) : (
            <div className="space-y-2">
              {hotkeys.map((hotkey, index) => (
                <div key={index} className="flex items-center justify-between bg-white border rounded-lg p-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        {hotkey.modifiers.map(modifier => (
                          <span key={modifier} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {modifier}
                          </span>
                        ))}
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                          {hotkey.key}
                        </span>
                      </div>
                      <span className="text-gray-600">→</span>
                      <span className="text-gray-900">{getActionLabel(hotkey.action)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {editingIndex === index ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-700"
                          title="Save"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-700"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditHotkey(index)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => unregisterHotkey(formatHotkeyString(hotkey))}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Information */}
      <div className="card">
        <h3 className="text-md font-medium text-gray-900 mb-3">About Hotkeys</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Hotkeys work globally across your system</p>
          <p>• Use Ctrl, Alt, Shift, or Cmd as modifiers</p>
          <p>• Function keys (F1-F12) and letter keys are supported</p>
          <p>• Hotkeys are saved automatically</p>
          <p>• You can edit or remove hotkeys at any time</p>
        </div>
      </div>
    </div>
  );
}

export default HotkeysPanel; 