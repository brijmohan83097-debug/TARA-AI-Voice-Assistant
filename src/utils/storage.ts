export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(`tara_${key}`) || localStorage.getItem(`aetheris_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Error loading key ${key} from storage:`, e);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`tara_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error saving key ${key} to storage:`, e);
  }
}
