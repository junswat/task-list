export interface Tab {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  order: number;
  isActive: boolean;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface AppState {
  tabs: Tab[];
  activeTab: string | null;
  tasks: {
    [tabId: string]: Task[];
  };
}