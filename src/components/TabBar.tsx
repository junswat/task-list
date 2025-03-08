import React, { useState, useRef } from 'react';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tab } from '../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

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
  const [tabToDelete, setTabToDelete] = useState<string | null>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const tabsListRef = useRef<HTMLDivElement>(null);

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

  const handleDeleteClick = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabToDelete(tabId);
  };

  const handleDeleteConfirm = () => {
    if (tabToDelete) {
      onTabRemove(tabToDelete);
      setTabToDelete(null);
    }
  };

  const checkScroll = () => {
    if (tabsListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsListRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (tabsListRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = tabsListRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      tabsListRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  React.useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [tabs]);

  return (
    <>
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 relative">
          <Tabs value={activeTab || undefined} className="w-full">
            <div className="relative flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute left-0 z-10 h-10 w-8 bg-gradient-to-r from-background to-transparent",
                  !showLeftScroll && "hidden"
                )}
                onClick={() => handleScroll('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div
                ref={tabsListRef}
                className="overflow-x-auto scrollbar-hide"
                onScroll={checkScroll}
              >
                <TabsList className="h-auto p-0 bg-transparent w-max min-w-full justify-start">
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
                            onClick={(e) => handleDeleteClick(tab.id, e)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TabsTrigger>
                  ))}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onTabAdd}
                    className="h-10 px-2 rounded-none hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TabsList>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute right-0 z-10 h-10 w-8 bg-gradient-to-l from-background to-transparent",
                  !showRightScroll && "hidden"
                )}
                onClick={() => handleScroll('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={tabToDelete !== null} onOpenChange={() => setTabToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>リストの削除</AlertDialogTitle>
            <AlertDialogDescription>
              このリストを削除してもよろしいですか？
              この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};