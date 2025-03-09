import React, { useState } from 'react';
import { GripVertical, Grip, X, ChevronRight, Plus } from 'lucide-react';
import { Tab, Separator } from '../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface SideBarProps {
  tabs: Tab[];
  separators: Separator[];
  activeTab: string | null;
  onTabSelect: (tabId: string) => void;
  onTabsReorder: (tabs: Tab[]) => void;
  onTabTitleChange?: (tabId: string, newTitle: string) => void;
  onSeparatorAdd: () => void;
  onSeparatorRemove: (id: string) => void;
  onSeparatorTitleChange: (id: string, newTitle: string) => void;
  onSeparatorsReorder: (separators: Separator[]) => void;
  onTabAdd: () => void;
  onTabRemove: (tabId: string) => void;
}

interface SortableTabItemProps {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
  isLastInGroup?: boolean;
  onDelete: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  isEditing: boolean;
  editingTitle: string;
  onEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditSubmit: () => void;
  onEditCancel: () => void;
}

interface SortableSeparatorItemProps {
  separator: Separator;
  onDoubleClick: () => void;
  onRemove: () => void;
  editing: boolean;
  editingTitle: string;
  onEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditSubmit: () => void;
  onEditCancel: () => void;
}

const SortableTabItem: React.FC<SortableTabItemProps> = ({
  tab,
  isActive,
  onClick,
  isLastInGroup,
  onDelete,
  onDoubleClick,
  isEditing,
  editingTitle,
  onEditChange,
  onEditSubmit,
  onEditCancel,
}) => {
  const [isGrouped, setIsGrouped] = useState(false);
  const [groupEditing, setGroupEditing] = useState(false);
  const [separatorText, setSeparatorText] = useState('');
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

  const handleSeparatorClick = () => {
    if (isGrouped) {
      setIsGrouped(false);
      setGroupEditing(false);
      setSeparatorText('');
    } else {
      setIsGrouped(true);
      setGroupEditing(true);
    }
  };

  return (
    <div className="relative">
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex items-center gap-2 p-1.5 rounded-md cursor-pointer ml-4 group",
          isActive ? "bg-accent" : "hover:bg-accent/50",
          isDragging && "opacity-50",
          isLastInGroup && "mb-6"
        )}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        <div
          className="h-5 w-5 p-0 cursor-grab active:cursor-grabbing flex items-center justify-center"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5 text-transparent" />
        </div>
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
            className="h-5 px-1 text-sm flex-1"
            autoFocus
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate flex-1 text-muted-foreground/70 font-medium text-sm">{tab.title}</span>
        )}
        {!isEditing && (
          <div
            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 flex items-center justify-center cursor-pointer"
            onClick={onDelete}
          >
            <X className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      {!isLastInGroup && (
        <div className="mt-1 mb-1">
          <div className="flex items-center pl-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-4 w-4 p-0 opacity-0 hover:opacity-100 transition-opacity",
                isGrouped && "opacity-100"
              )}
              onClick={handleSeparatorClick}
            >
              <ChevronRight className={cn(
                "h-3 w-3 text-muted-foreground/50",
                isGrouped && "text-muted-foreground/80 rotate-90"
              )} />
            </Button>
            <div className="flex-1 mx-2">
              {groupEditing ? (
                <Input
                  type="text"
                  value={separatorText}
                  onChange={(e) => setSeparatorText(e.target.value)}
                  placeholder="グループの説明を入力"
                  className="h-6 px-2 text-xs bg-transparent"
                  autoFocus
                  onBlur={() => setGroupEditing(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setGroupEditing(false);
                    }
                    if (e.key === 'Escape') {
                      setGroupEditing(false);
                      setSeparatorText('');
                      setIsGrouped(false);
                    }
                  }}
                />
              ) : (
                <div
                  className={cn(
                    "h-[1px] border-0 border-b [border-bottom-style:dashed] [border-bottom-width:1px] [border-bottom-color:hsl(var(--muted-foreground)/.3)] [border-bottom-dash-length:8px] [border-bottom-gap-length:8px] transition-all relative",
                    isGrouped && "!border-solid !border-muted-foreground/20",
                  )}
                >
                  {isGrouped && separatorText && (
                    <span className="absolute -top-3 left-0 text-sm font-medium">
                      {separatorText}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SortableSeparatorItem: React.FC<SortableSeparatorItemProps> = ({
  separator,
  onDoubleClick,
  onRemove,
  editing,
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
  } = useSortable({ id: separator.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 py-2 text-sm font-medium border-b border-t bg-muted/30 group first:border-t-0",
        isDragging && "opacity-50"
      )}
      onDoubleClick={onDoubleClick}
    >
      {editing ? (
        <Input
          type="text"
          value={editingTitle}
          onChange={onEditChange}
          onBlur={onEditSubmit}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') onEditSubmit();
            if (e.key === 'Escape') onEditCancel();
          }}
          className="flex-1 h-5 px-1 mx-2 text-sm"
          autoFocus
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        />
      ) : (
        <>
          <div
            className="h-5 w-5 p-0 cursor-grab active:cursor-grabbing ml-2 flex items-center justify-center"
            {...attributes}
            {...listeners}
          >
            <Grip className="h-3.5 w-3.5" />
          </div>
          <span className="truncate flex-1">{separator.title}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 mr-2"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </div>
  );
};

export const SideBar: React.FC<SideBarProps> = ({
  tabs,
  separators,
  activeTab,
  onTabSelect,
  onTabsReorder,
  onTabTitleChange,
  onSeparatorAdd,
  onSeparatorRemove,
  onSeparatorTitleChange,
  onSeparatorsReorder,
  onTabAdd,
  onTabRemove,
}) => {
  const [editingSeparatorId, setEditingSeparatorId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [tabToDelete, setTabToDelete] = useState<string | null>(null);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabTitle, setEditingTabTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    // アイテムの現在の配列を取得（順序でソート済み）
    const allItems = [...tabs, ...separators].sort((a, b) => a.order - b.order);
    
    // 移動元と移動先のインデックスを取得
    const oldIndex = allItems.findIndex(item => item.id === active.id);
    const newIndex = allItems.findIndex(item => item.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;

    // 新しい配列を作成
    const newItems = arrayMove(allItems, oldIndex, newIndex);

    // 順序を1から連番で振り直す
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    // タブとセパレーターを分離して更新
    const updatedTabs = updatedItems.filter(item => !('type' in item)) as Tab[];
    const updatedSeparators = updatedItems.filter(item => 'type' in item) as Separator[];

    onTabsReorder(updatedTabs);
    onSeparatorsReorder(updatedSeparators);
  };

  const handleSeparatorDoubleClick = (separator: Separator) => {
    setEditingSeparatorId(separator.id);
    setEditingTitle(separator.title);
  };

  const handleSeparatorTitleSubmit = (id: string) => {
    if (editingTitle.trim()) {
      onSeparatorTitleChange(id, editingTitle.trim());
    }
    setEditingSeparatorId(null);
  };

  const handleDeleteClick = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabToDelete(tabId);
  };

  const handleDeleteConfirm = React.useCallback(() => {
    if (tabToDelete && onTabRemove) {
      onTabRemove(tabToDelete);
      setTabToDelete(null);
    }
  }, [tabToDelete, onTabRemove]);

  const handleTabDoubleClick = (tab: Tab) => {
    setEditingTabId(tab.id);
    setEditingTabTitle(tab.title);
  };

  const handleTabTitleSubmit = (tabId: string) => {
    if (editingTabTitle.trim() && onTabTitleChange) {
      onTabTitleChange(tabId, editingTabTitle.trim());
    }
    setEditingTabId(null);
  };

  // すべてのアイテムをorderで並び替えた配列を作成
  const sortedItems = React.useMemo(() => {
    // 両方の配列が存在することを確認
    const validTabs = Array.isArray(tabs) ? tabs : [];
    const validSeparators = Array.isArray(separators) ? separators : [];

    // nullやundefinedを除外し、必要なプロパティを持つアイテムのみをフィルタリング
    return [...validTabs, ...validSeparators]
      .filter(item => (
        item !== null &&
        item !== undefined &&
        typeof item === 'object' &&
        'id' in item &&
        typeof item.id === 'string'
      ))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [tabs, separators]);

  // items配列を安全に生成
  const sortableItems = React.useMemo(() => {
    return sortedItems.map(item => item.id).filter(Boolean);
  }, [sortedItems]);

  return (
    <>
      <div className="w-64 h-[calc(100vh-4rem)] border-r bg-card">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">チェック項目</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onTabAdd}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortableItems}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-0">
                {sortedItems.map((item, index) => {
                  if (!item || !item.id) return null;
                  if ('type' in item && item.type === 'separator') {
                    const separator = item as Separator;
                    return (
                      <SortableSeparatorItem
                        key={separator.id}
                        separator={separator}
                        onDoubleClick={() => handleSeparatorDoubleClick(separator)}
                        onRemove={() => onSeparatorRemove(separator.id)}
                        editing={editingSeparatorId === separator.id}
                        editingTitle={editingTitle}
                        onEditChange={(e) => setEditingTitle(e.target.value)}
                        onEditSubmit={() => handleSeparatorTitleSubmit(separator.id)}
                        onEditCancel={() => setEditingSeparatorId(null)}
                      />
                    );
                  } else {
                    const tab = item as Tab;
                    const nextItem = sortedItems[index + 1];
                    const isLastInGroup = !nextItem || ('type' in nextItem && nextItem.type === 'separator');
                    return (
                      <SortableTabItem
                        key={tab.id}
                        tab={tab}
                        isActive={tab.id === activeTab}
                        onClick={() => onTabSelect(tab.id)}
                        isLastInGroup={isLastInGroup}
                        onDelete={(e) => handleDeleteClick(tab.id, e)}
                        onDoubleClick={() => handleTabDoubleClick(tab)}
                        isEditing={editingTabId === tab.id}
                        editingTitle={editingTabTitle}
                        onEditChange={(e) => setEditingTabTitle(e.target.value)}
                        onEditSubmit={() => handleTabTitleSubmit(tab.id)}
                        onEditCancel={() => setEditingTabId(null)}
                      />
                    );
                  }
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      <AlertDialog open={!!tabToDelete} onOpenChange={() => setTabToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>リストを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              このリストに含まれるすべてのタスクが削除されます。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteConfirm()}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}; 