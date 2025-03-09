export interface Tab {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  order: number;
  isActive: boolean;
  isGrouped?: boolean;
  groupText?: string;
}

export interface Separator {
  id: string;
  title: string;
  order: number;
  type: 'separator';
  isGrouped?: boolean;
  groupText?: string;
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
  separators: Separator[];
  activeTab: string | null;
  tasks: {
    [tabId: string]: Task[];
  };
}