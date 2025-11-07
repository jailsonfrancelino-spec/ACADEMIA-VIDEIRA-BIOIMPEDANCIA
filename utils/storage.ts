import { Student } from '../types';

const STORAGE_KEY = 'academiaVideiraStudents';

export const getStudentsFromStorage = (): Student[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to parse students from localStorage", error);
    return [];
  }
};

export const saveStudentsToStorage = (students: Student[]): void => {
  try {
    const data = JSON.stringify(students);
    localStorage.setItem(STORAGE_KEY, data);
  } catch (error) {
    console.error("Failed to save students to localStorage", error);
  }
};
