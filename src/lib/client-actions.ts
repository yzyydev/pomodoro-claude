'use client';

import { FocusRecommendation, Task } from './types';
import { createTask } from './actions';

// Client-side wrapper for creating a task
export async function createTaskClient(
  title: string,
  description: string,
  onProgress?: (message: string) => void,
  onError?: (error: string) => void
): Promise<Task | null> {
  try {
    if (onProgress) {
      onProgress('Getting AI recommendation...');
    }
    
    const task = await createTask(title, description);
    
    if (onProgress) {
      onProgress('Task created successfully!');
    }
    
    return task;
  } catch (error) {
    console.error('Error creating task:', error);
    
    if (onError) {
      onError(error instanceof Error ? error.message : 'Failed to create task');
    }
    
    return null;
  }
}

// Mock function to provide immediate feedback during development
// This can be used if the real API is slow or unavailable
export function getMockRecommendation(
  title: string,
  description: string
): FocusRecommendation {
  console.log('Getting mock recommendation for:', title);
  
  // Generate a recommendation based on task description length
  const complexityFactor = Math.min(description.length / 100, 1);
  const baseTime = 25; // minutes
  
  const recommendedDuration = Math.max(
    15,
    Math.min(45, Math.round(baseTime + (complexityFactor * 20)))
  );
  
  const breakDuration = Math.max(
    5,
    Math.min(15, Math.round(5 + (complexityFactor * 10)))
  );
  
  return {
    recommendedDuration,
    breakDuration,
    reasoning: `Based on the complexity of "${title}", a ${recommendedDuration} minute focus session is recommended, followed by a ${breakDuration} minute break.`,
    confidenceScore: 0.7,
  };
}