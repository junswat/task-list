import React from 'react';
import { GripVertical } from 'lucide-react';
import { Tab } from '../types';
import { Button } from "@/components/ui/button";
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
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from "@/lib/utils";

interface SideBarProps {
  tabs: Tab[];
  activeTab: string | null;
  onTabSelect: (tabId: string) => void;
  onTabsReorder: (tabs: Tab[]) => void;
}

interface SortableTabItemProps {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
}

const SortableTabItem: React.FC<SortableTabItemProps> = ({
  tab,
  isActive,
  onClick,
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-2 rounded-md cursor-pointer",
        isActive ? "bg-accent" : "hover:bg-accent/50",
        isDragging && "opacity-50"
      )}
      onClick={onClick}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </Button>
      <span className="truncate flex-1">{tab.title}</span>
    </div>
  );
};

export const SideBar: React.FC<SideBarProps> = ({
  tabs,
  activeTab,
  onTabSelect,
  onTabsReorder,
}) => {
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

  return (
    <div className="w-64 h-[calc(100vh-4rem)] border-r bg-card">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">リスト一覧</h2>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tabs.map(tab => tab.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {tabs.map((tab) => (
                <SortableTabItem
                  key={tab.id}
                  tab={tab}
                  isActive={tab.id === activeTab}
                  onClick={() => onTabSelect(tab.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}; 