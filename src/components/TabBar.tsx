import React, { useState, useRef } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, GripHorizontal } from 'lucide-react';
import { Tab } from '../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  onTabsReorder: (tabs: Tab[]) => void;
}

interface SortableTabProps {
  tab: Tab;
  isActive: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  isEditing: boolean;
  editingTitle: string;
  onEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditSubmit: () => void;
  onEditCancel: () => void;
}

const SortableTab: React.FC<SortableTabProps> = ({
  tab,
  isActive,
  onSelect,
  onDoubleClick,
  onDelete,
  isEditing,
  editingTitle,
  onEditChange,
  onEditSubmit,
  onEditCancel,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <TabsTrigger
      ref={setNodeRef}
      style={style}
      value={tab.id}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      className={cn(
        "relative data-[state=active]:bg-background px-4 h-[42px]",
        isDragging && "opacity-50"
      )}
    >
      {isEditing ? (
        <Input
          type="text"
          value={editingTitle}
          onChange={onEditChange}
          onBlur={onEditSubmit}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') onEditSubmit();
            if (e.key === 'Escape') onEditCancel();
          }}
          className="w-[120px] h-6 px-1"
          autoFocus
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        />
      ) : (
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing flex items-center justify-center"
            {...attributes}
            {...listeners}
          >
            <GripHorizontal className="h-4 w-4" />
          </div>
          <span className="truncate">{tab.title}</span>
          <div
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 flex items-center justify-center cursor-pointer"
            onClick={onDelete}
          >
            <X className="h-4 w-4" />
          </div>
        </div>
      )}
    </TabsTrigger>
  );
};

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabSelect,
  onTabAdd,
  onTabRemove,
  onTabTitleChange,
  onTabsReorder,
}) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [tabToDelete, setTabToDelete] = useState<string | null>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const tabsListRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex((tab) => tab.id === active.id);
      const newIndex = tabs.findIndex((tab) => tab.id === over.id);
      const newTabs = arrayMove(tabs, oldIndex, newIndex);
      onTabsReorder(newTabs);
    }
  };

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
                  "absolute left-0 z-10 h-[42px] w-8 bg-gradient-to-r from-background to-transparent",
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
                <TabsList className="inline-flex h-[42px] border-b-0">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={tabs.map(tab => tab.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      {tabs.map((tab) => (
                        <SortableTab
                          key={tab.id}
                          tab={tab}
                          isActive={tab.id === activeTab}
                          onSelect={() => onTabSelect(tab.id)}
                          onDoubleClick={() => handleDoubleClick(tab)}
                          onDelete={(e) => handleDeleteClick(tab.id, e)}
                          isEditing={editingTabId === tab.id}
                          editingTitle={editingTitle}
                          onEditChange={(e) => setEditingTitle(e.target.value)}
                          onEditSubmit={() => handleTitleSubmit(tab.id)}
                          onEditCancel={() => setEditingTabId(null)}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-[42px] w-10 shrink-0"
                    onClick={onTabAdd}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TabsList>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute right-0 z-10 h-[42px] w-8 bg-gradient-to-l from-background to-transparent",
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

      <AlertDialog open={!!tabToDelete} onOpenChange={() => setTabToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>タブを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              このタブに含まれるすべてのタスクが削除されます。この操作は取り消せません。
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