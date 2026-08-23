import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface TodoState {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      todos: [],
      addTodo: (text: string) => set((state) => ({
        todos: [
          {
            id: Date.now().toString(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
          },
          ...state.todos
        ]
      })),
      toggleTodo: (id: string) => set((state) => ({
        todos: state.todos.map(todo => 
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      })),
      deleteTodo: (id: string) => set((state) => ({
        todos: state.todos.filter(todo => todo.id !== id)
      }))
    }),
    {
      name: 'todo-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
