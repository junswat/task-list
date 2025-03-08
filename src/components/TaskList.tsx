import React, { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onTaskAdd: (text: string) => void;
  onTaskToggle: (taskId: string) => void;
  onTaskRemove: (taskId: string) => void;
  onTaskEdit: (taskId: string, newText: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskAdd,
  onTaskToggle,
  onTaskRemove,
  onTaskEdit,
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
    <div className="flex-1 overflow-y-auto p-4">
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
          <div className="my-6 border-t border-gray-200" />
          <h3 className="text-sm text-gray-500 mb-4">完了したタスク</h3>
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
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <Plus size={20} className="text-gray-400" />
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="新しいタスクを追加..."
            className="flex-1 bg-transparent outline-none"
          />
        </div>
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
    <div
      className={`flex items-center gap-3 p-3 rounded-lg group ${
        task.completed ? 'bg-gray-50' : 'bg-white border border-gray-200'
      }`}
    >
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded-full border ${
          task.completed
            ? 'bg-blue-500 border-blue-500'
            : 'border-gray-300 hover:border-blue-500'
        } flex items-center justify-center`}
      >
        {task.completed && <Check size={12} className="text-white" />}
      </button>
      
      {isEditing ? (
        <input
          type="text"
          value={editingText}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onEditSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEditSubmit();
            if (e.key === 'Escape') onEditCancel();
          }}
          className="flex-1 bg-transparent outline-none"
          autoFocus
        />
      ) : (
        <span
          onDoubleClick={onEdit}
          className={`flex-1 ${
            task.completed ? 'text-gray-400 line-through' : 'text-gray-700'
          }`}
        >
          {task.text}
        </span>
      )}

      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded"
      >
        <X size={14} className="text-gray-400" />
      </button>
    </div>
  );
};