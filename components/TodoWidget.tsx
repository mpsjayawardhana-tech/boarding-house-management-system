"use client";

import { useState } from 'react';
import { useTodoStore } from '@/store/useTodoStore';
import { Plus, Trash2, Circle, CheckCircle2, ListTodo } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function TodoWidget() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodoStore();
  const [inputValue, setInputValue] = useState('');

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    addTodo(inputValue.trim());
    setInputValue('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg shadow-black/20 rounded-2xl p-6">
        <form onSubmit={handleAdd} className="flex gap-3">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-gray-500"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-emerald-500 text-black px-6 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </form>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg shadow-black/20 rounded-2xl p-6 flex-1 min-h-[400px]">
        
        {todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 pt-20">
            <ListTodo className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-medium text-lg text-gray-400">All caught up!</p>
            <p className="text-sm">Add a task above to get started.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {todos.map(todo => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  key={todo.id}
                  className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                    todo.completed 
                      ? 'bg-black/20 border-white/5 opacity-60 hover:opacity-80' 
                      : 'bg-[#141618]/60 border-white/10 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleTodo(todo.id)}>
                    <button className={`shrink-0 transition-colors ${todo.completed ? 'text-emerald-500' : 'text-gray-500 hover:text-emerald-400'}`}>
                      {todo.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </button>
                    <span className={`text-base font-medium transition-all ${todo.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                      {todo.text}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="p-2 rounded-lg text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all focus:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
