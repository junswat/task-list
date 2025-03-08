import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Tab } from '../types';

interface TabBarProps {
  tabs: Tab[];
  activeTab: string | null;
  onTabSelect: (tabId: string) => void;
  onTabAdd: () => void;
  onTabRemove: (tabId: string) => void;
  onTabTitleChange: (tabId: string, newTitle: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabSelect,
  onTabAdd,
  onTabRemove,
  onTabTitleChange,
}) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleDoubleClick = (tab: Tab) => {
    setEditingTabId(tab.id);
    setEditingTitle(tab.title);
  };

  const handleTitleSubmit = (tabId: string) => {
    if (editingTitle.trim()) {
      onTabTitleChange(tabId, editingTitle.trim());
    }
    setEditingTabId(null);
  };

  return (
    <div className="flex items-center bg-gray-100 border-b border-gray-200 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center min-w-[120px] max-w-[200px] h-10 px-4 border-r border-gray-200 cursor-pointer group ${
            tab.id === activeTab
              ? 'bg-white border-b-2 border-b-blue-500'
              : 'bg-gray-50 hover:bg-gray-100'
          }`}
          onClick={() => onTabSelect(tab.id)}
          onDoubleClick={() => handleDoubleClick(tab)}
        >
          {editingTabId === tab.id ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={() => handleTitleSubmit(tab.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit(tab.id);
                if (e.key === 'Escape') setEditingTabId(null);
              }}
              className="w-full bg-white px-1 outline-none"
              autoFocus
            />
          ) : (
            <>
              <span className="flex-1 truncate">{tab.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabRemove(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-gray-200 rounded"
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>
      ))}
      <button
        onClick={onTabAdd}
        className="flex items-center justify-center w-10 h-10 min-w-[40px] hover:bg-gray-200"
        title="新しいタブを追加"
      >
        <Plus size={20} />
      </button>
    </div>
  );
};