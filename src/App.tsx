import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TabBar } from './components/TabBar';
import { TaskList } from './components/TaskList';
import { AppState, Tab, Task } from './types';
import { loadState, saveState } from './store/localStorage';

function App() {
  const [state, setState] = useState<AppState>(() => {
    const savedState = loadState();
    if (savedState) return savedState;

    // Initialize with a default tab
    const defaultTab: Tab = {
      id: uuidv4(),
      title: '新しいリスト',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: 0,
      isActive: true,
    };

    return {
      tabs: [defaultTab],
      activeTab: defaultTab.id,
      tasks: { [defaultTab.id]: [] },
    };
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleTabAdd = () => {
    const newTab: Tab = {
      id: uuidv4(),
      title: '新しいリスト',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: state.tabs.length,
      isActive: true,
    };

    setState((prev) => ({
      ...prev,
      tabs: [...prev.tabs, newTab],
      activeTab: newTab.id,
      tasks: { ...prev.tasks, [newTab.id]: [] },
    }));
  };

  const handleTabRemove = (tabId: string) => {
    setState((prev) => {
      const newTabs = prev.tabs.filter((tab) => tab.id !== tabId);
      const { [tabId]: removedTasks, ...remainingTasks } = prev.tasks;
      
      return {
        ...prev,
        tabs: newTabs,
        activeTab: newTabs.length > 0 ? newTabs[0].id : null,
        tasks: remainingTasks,
      };
    });
  };

  const handleTabTitleChange = (tabId: string, newTitle: string) => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((tab) =>
        tab.id === tabId
          ? { ...tab, title: newTitle, updatedAt: new Date().toISOString() }
          : tab
      ),
    }));
  };

  const handleTaskAdd = (text: string) => {
    if (!state.activeTab) return;

    const newTask: Task = {
      id: uuidv4(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: state.tasks[state.activeTab].length,
    };

    setState((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [prev.activeTab!]: [...prev.tasks[prev.activeTab!], newTask],
      },
    }));
  };

  const handleTaskToggle = (taskId: string) => {
    if (!state.activeTab) return;

    setState((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [prev.activeTab!]: prev.tasks[prev.activeTab!].map((task) =>
          task.id === taskId
            ? {
                ...task,
                completed: !task.completed,
                updatedAt: new Date().toISOString(),
              }
            : task
        ),
      },
    }));
  };

  const handleTaskRemove = (taskId: string) => {
    if (!state.activeTab) return;

    setState((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [prev.activeTab!]: prev.tasks[prev.activeTab!].filter(
          (task) => task.id !== taskId
        ),
      },
    }));
  };

  const handleTaskEdit = (taskId: string, newText: string) => {
    if (!state.activeTab) return;

    setState((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [prev.activeTab!]: prev.tasks[prev.activeTab!].map((task) =>
          task.id === taskId
            ? { ...task, text: newText, updatedAt: new Date().toISOString() }
            : task
        ),
      },
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <h1 className="text-xl font-semibold">
            タスク管理アプリ
          </h1>
        </div>
      </header>

      <TabBar
        tabs={state.tabs}
        activeTab={state.activeTab}
        onTabSelect={(tabId) => setState((prev) => ({ ...prev, activeTab: tabId }))}
        onTabAdd={handleTabAdd}
        onTabRemove={handleTabRemove}
        onTabTitleChange={handleTabTitleChange}
      />

      {state.activeTab && (
        <TaskList
          tasks={state.tasks[state.activeTab]}
          onTaskAdd={handleTaskAdd}
          onTaskToggle={handleTaskToggle}
          onTaskRemove={handleTaskRemove}
          onTaskEdit={handleTaskEdit}
        />
      )}
    </div>
  );
}

export default App;