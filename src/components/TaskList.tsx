import React, { useState } from 'react';
import { Check, Plus, X, RotateCcw } from 'lucide-react';
import { Task } from '../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface TaskListProps {
  tasks: Task[];
  onTaskAdd: (text: string) => void;
  onTaskToggle: (taskId: string) => void;
  onTaskRemove: (taskId: string) => void;
  onTaskEdit: (taskId: string, newText: string) => void;
  onUncompleteAll: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskAdd,
  onTaskToggle,
  onTaskRemove,
  onTaskEdit,
  onUncompleteAll,
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onTaskAdd(newTaskText.trim());
      setNewTaskText('');
    }
  };

  const handleEditSubmit = (taskId: string) => {
    if (editingText.trim()) {
      onTaskEdit(taskId, editingText.trim());
    }
    setEditingTaskId(null);
  };

  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="flex-1 overflow-y-auto p-4 container mx-auto">
      {/* Incomplete Tasks */}
      <div className="space-y-2">
        {incompleteTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isEditing={editingTaskId === task.id}
            editingText={editingText}
            onToggle={() => onTaskToggle(task.id)}
            onRemove={() => onTaskRemove(task.id)}
            onEdit={() => {
              setEditingTaskId(task.id);
              setEditingText(task.text);
            }}
            onEditChange={setEditingText}
            onEditSubmit={() => handleEditSubmit(task.id)}
            onEditCancel={() => setEditingTaskId(null)}
          />
        ))}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <>
          <div className="my-6 border-t" />
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm text-muted-foreground">完了したタスク</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onUncompleteAll}
              className="h-8"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              すべて未完了に戻す
            </Button>
          </div>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isEditing={editingTaskId === task.id}
                editingText={editingText}
                onToggle={() => onTaskToggle(task.id)}
                onRemove={() => onTaskRemove(task.id)}
                onEdit={() => {
                  setEditingTaskId(task.id);
                  setEditingText(task.text);
                }}
                onEditChange={setEditingText}
                onEditSubmit={() => handleEditSubmit(task.id)}
                onEditCancel={() => setEditingTaskId(null)}
              />
            ))}
          </div>
        </>
      )}

      {/* Add New Task */}
      <form onSubmit={handleTaskSubmit} className="mt-6">
        <Card className="flex items-center gap-2 p-2">
          <Plus className="h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={newTaskText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTaskText(e.target.value)}
            placeholder="新しいタスクを追加..."
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </Card>
      </form>
    </div>
  );
};

interface TaskItemProps {
  task: Task;
  isEditing: boolean;
  editingText: string;
  onToggle: () => void;
  onRemove: () => void;
  onEdit: () => void;
  onEditChange: (text: string) => void;
  onEditSubmit: () => void;
  onEditCancel: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isEditing,
  editingText,
  onToggle,
  onRemove,
  onEdit,
  onEditChange,
  onEditSubmit,
  onEditCancel,
}) => {
  return (
    <Card className={`flex items-center gap-3 p-3 group ${task.completed ? 'bg-muted/50' : ''}`}>
      <Checkbox
        checked={task.completed}
        onCheckedChange={onToggle}
      />
      
      {isEditing ? (
        <Input
          type="text"
          value={editingText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEditChange(e.target.value)}
          onBlur={onEditSubmit}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') onEditSubmit();
            if (e.key === 'Escape') onEditCancel();
          }}
          className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          autoFocus
        />
      ) : (
        <span
          onDoubleClick={onEdit}
          className={`flex-1 ${
            task.completed ? 'text-muted-foreground line-through' : ''
          }`}
        >
          {task.text}
        </span>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 h-8 w-8"
      >
        <X className="h-4 w-4" />
      </Button>
    </Card>
  );
};