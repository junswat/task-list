import { AppState, Tab, Task } from '../types';

const STORAGE_KEY = 'task-management-app';

export const loadState = (): AppState | undefined => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) return undefined;
    const state = JSON.parse(serializedState);
    
    // 必要なプロパティの存在チェック
    if (!state.tabs || !Array.isArray(state.tabs) || 
        !state.separators || !Array.isArray(state.separators) ||
        !state.tasks || typeof state.tasks !== 'object') {
      console.error('Invalid state structure');
      return undefined;
    }
    
    return state;
  } catch (err) {
    console.error('Error loading state:', err);
    return undefined;
  }
};

export const saveState = (state: AppState): void => {
  try {
    // 保存前の状態チェック
    if (!state.tabs || !Array.isArray(state.tabs) || 
        !state.separators || !Array.isArray(state.separators) ||
        !state.tasks || typeof state.tasks !== 'object') {
      throw new Error('Invalid state structure');
    }
    
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error('Error saving state:', err);
    localStorage.removeItem(STORAGE_KEY); // 問題がある場合は状態をクリア
  }
};