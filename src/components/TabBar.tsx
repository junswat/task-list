import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Tab } from '../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="border-b bg-muted/40">
      <div className="container mx-auto px-4 flex items-center">
        <Tabs value={activeTab || undefined} className="flex-1">
          <TabsList className="h-auto p-0 bg-transparent">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                onClick={() => onTabSelect(tab.id)}
                onDoubleClick={() => handleDoubleClick(tab)}
                className="relative data-[state=active]:bg-background px-4 py-2 h-10"
              >
                {editingTabId === tab.id ? (
                  <Input
                    type="text"
                    value={editingTitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingTitle(e.target.value)}
                    onBlur={() => handleTitleSubmit(tab.id)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') handleTitleSubmit(tab.id);
                      if (e.key === 'Escape') setEditingTabId(null);
                    }}
                    className="w-[120px] h-6 px-1"
                    autoFocus
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="truncate">{tab.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onTabRemove(tab.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button
          variant="ghost"
          size="icon"
          onClick={onTabAdd}
          className="ml-2"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};