import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TabBar } from './components/TabBar';
import { TaskList } from './components/TaskList';
import { SideBar } from './components/SideBar';
import { HeaderMenu } from './components/HeaderMenu';
import { AppState, Tab, Task, Separator } from './types';
import { loadState, saveState } from './store/localStorage';
import { ThemeProvider } from './components/theme-provider';

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
      separators: [],
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

  const handleUncompleteAll = () => {
    if (!state.activeTab) return;

    setState((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [prev.activeTab!]: prev.tasks[prev.activeTab!].map((task) =>
          task.completed
            ? {
                ...task,
                completed: false,
                updatedAt: new Date().toISOString(),
              }
            : task
        ),
      },
    }));
  };

  const handleTabsReorder = (newTabs: Tab[]) => {
    setState((prev) => ({
      ...prev,
      tabs: newTabs.map((tab, index) => ({
        ...tab,
        order: index,
        updatedAt: new Date().toISOString(),
      })),
    }));
  };

  const handleTasksReorder = (newTasks: Task[]) => {
    if (!state.activeTab) return;

    setState((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [prev.activeTab!]: newTasks.map((task) => ({
          ...task,
          updatedAt: new Date().toISOString(),
        })),
      },
    }));
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `checklist-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (data: AppState) => {
    try {
      // バリデーション
      if (!data.tabs || !data.tasks || !data.activeTab) {
        throw new Error('Invalid data format');
      }

      setState(data);
      alert('データのインポートが完了しました。');
    } catch (error) {
      alert('インポートに失敗しました。データの形式が正しくありません。');
    }
  };

  const handleSeparatorAdd = () => {
    const newSeparator: Separator = {
      id: uuidv4(),
      title: '新しいグループ',
      order: state.separators.length,
      type: 'separator',
    };

    setState((prev) => ({
      ...prev,
      separators: [...prev.separators, newSeparator],
    }));
  };

  const handleSeparatorRemove = (id: string) => {
    setState((prev) => ({
      ...prev,
      separators: prev.separators.filter((sep) => sep.id !== id),
    }));
  };

  const handleSeparatorTitleChange = (id: string, newTitle: string) => {
    setState((prev) => ({
      ...prev,
      separators: prev.separators.map((sep) =>
        sep.id === id ? { ...sep, title: newTitle } : sep
      ),
    }));
  };

  const handleSeparatorsReorder = (newSeparators: Separator[]) => {
    setState((prev) => ({
      ...prev,
      separators: newSeparators.map((sep, index) => ({
        ...sep,
        order: index,
      })),
    }));
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <HeaderMenu
          onExport={handleExport}
          onImport={handleImport}
        />
        <div className="flex h-screen pt-4">
          <SideBar
            tabs={state.tabs}
            separators={state.separators}
            activeTab={state.activeTab}
            onTabSelect={(tabId) => setState((prev) => ({ ...prev, activeTab: tabId }))}
            onTabsReorder={handleTabsReorder}
            onTabTitleChange={handleTabTitleChange}
            onSeparatorAdd={handleSeparatorAdd}
            onSeparatorRemove={handleSeparatorRemove}
            onSeparatorTitleChange={handleSeparatorTitleChange}
            onSeparatorsReorder={handleSeparatorsReorder}
            onTabAdd={handleTabAdd}
            onTabRemove={handleTabRemove}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <TabBar
              tabs={state.tabs}
              activeTab={state.activeTab}
              onTabSelect={(tabId) => setState((prev) => ({ ...prev, activeTab: tabId }))}
              onTabAdd={handleTabAdd}
              onTabRemove={handleTabRemove}
              onTabTitleChange={handleTabTitleChange}
              onTabsReorder={handleTabsReorder}
            />
            {state.activeTab && (
              <TaskList
                tasks={state.tasks[state.activeTab]}
                onTaskAdd={handleTaskAdd}
                onTaskToggle={handleTaskToggle}
                onTaskRemove={handleTaskRemove}
                onTaskEdit={handleTaskEdit}
                onUncompleteAll={handleUncompleteAll}
                onTasksReorder={handleTasksReorder}
              />
            )}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;