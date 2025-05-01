'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Task } from '@/lib/types';
import { createTaskClient, getMockRecommendation } from '@/lib/client-actions';

interface TaskInputProps {
  onTaskCreated: (task: Task) => void;
}

const TaskInput = ({ onTaskCreated }: TaskInputProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(false);
  
  const { addTask } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setProgress('Preparing request...');
    
    try {
      if (useMock) {
        // Use mock recommendation for faster development
        setProgress('Using mock recommendation service...');
        
        const recommendation = getMockRecommendation(title, description);
        
        // Create a task with the mock recommendation
        const mockTask: Task = {
          id: `mock-${Date.now()}`,
          title,
          description,
          recommendedDuration: recommendation.recommendedDuration,
          breakDuration: recommendation.breakDuration,
          createdAt: new Date(),
        };
        
        // Add to store
        addTask(mockTask);
        onTaskCreated(mockTask);
      } else {
        // Call server action to create task with real AI recommendation
        const task = await createTaskClient(
          title, 
          description, 
          (msg) => setProgress(msg),
          (err) => setError(err)
        );
        
        if (task) {
          // Add to store
          addTask(task);
          
          // Call the callback
          onTaskCreated(task);
        }
      }
      
      // Reset form
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task. Please try again.');
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">What are you working on?</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
            Task Title
          </label>
          <input
            type="text"
            id="task-title"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="E.g., Write report introduction"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (helps AI suggest optimal duration)
          </label>
          <textarea
            id="task-description"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="What does this task involve? How complex is it?"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="use-mock"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={useMock}
            onChange={(e) => setUseMock(e.target.checked)}
            disabled={isLoading}
          />
          <label htmlFor="use-mock" className="ml-2 block text-sm text-gray-700">
            Use quick mode (skip AI recommendation)
          </label>
        </div>
        
        {error && (
          <div className="mb-4 p-2 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        {progress && (
          <div className="mb-4 p-2 text-sm text-primary-700 bg-primary-100 rounded-md">
            {progress}
          </div>
        )}
        
        <button
          type="submit"
          className="btn btn-primary w-full flex justify-center items-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {useMock ? 'Creating Task...' : 'Getting AI recommendation...'}
            </>
          ) : (
            useMock ? 'Start Focus Session' : 'Get AI Recommendation & Start Focus'
          )}
        </button>
      </form>
    </div>
  );
};

export default TaskInput;