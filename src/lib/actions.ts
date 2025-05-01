'use server';

import { FocusRecommendation, Task } from './types';
import { v4 as uuidv4 } from 'uuid';

// Get AI recommendation for task duration
export async function getTaskRecommendation(
  taskTitle: string,
  taskDescription: string
): Promise<FocusRecommendation> {
  try {
    console.log('Getting AI recommendation for task:', taskTitle);
    
    // When running in server actions, we need an absolute URL
    // Get the base URL from environment or use a fallback
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const apiUrl = `${baseUrl}/api/ai-focus`;
    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: {
          title: taskTitle,
          description: taskDescription,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const content = await response.text();
    console.log('API response content:', content);
    
    let recommendation: FocusRecommendation;
    
    try {
      recommendation = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse API response:', parseError);
      throw new Error(`Failed to parse response: ${content}`);
    }
    
    console.log('Parsed recommendation:', recommendation);
    return recommendation;
  } catch (error) {
    console.error('Failed to get task recommendation:', error);
    
    // Fallback to default values if API call fails
    return {
      recommendedDuration: 25, // Default Pomodoro duration
      breakDuration: 5, // Default break duration
      reasoning: 'Using default Pomodoro duration due to error in AI recommendation.',
      confidenceScore: 0.5,
    };
  }
}

// Create a new task with recommendation
export async function createTask(
  title: string,
  description: string
): Promise<Task> {
  // Get recommendation for the task
  const recommendation = await getTaskRecommendation(title, description);
  
  // Create new task object
  const task: Task = {
    id: uuidv4(),
    title,
    description,
    recommendedDuration: recommendation.recommendedDuration,
    breakDuration: recommendation.breakDuration,
    createdAt: new Date(),
  };
  
  return task;
}

// Calculate XP for completed session
export async function calculateSessionXP(
  sessionDuration: number,
  isCompleted: boolean,
  confidenceScore: number
): Promise<number> {
  if (!isCompleted) return 0;
  
  // Base XP: 10 XP per 25 minutes of focus time
  const baseXP = Math.round((sessionDuration / 25) * 10);
  
  // Bonus if the confidence score was high (good prediction)
  const confidenceBonus = Math.round(confidenceScore * 5);
  
  return baseXP + confidenceBonus;
}

// Check for badge unlocks
export async function checkBadgeUnlocks(
  totalSessions: number,
  totalFocusTime: number,
  currentStreak: number,
  completionRate: number
): Promise<string[]> {
  const unlockedBadges: string[] = [];
  
  // First Pomodoro badge
  if (totalSessions >= 1) {
    unlockedBadges.push('first-pomodoro');
  }
  
  // Focused Novice badge
  if (totalSessions >= 10) {
    unlockedBadges.push('focused-novice');
  }
  
  // Streak badge
  if (currentStreak >= 3) {
    unlockedBadges.push('streak-starter');
  }
  
  // Time Master badge
  if (totalFocusTime >= 300) { // 5 hours in minutes
    unlockedBadges.push('time-master');
  }
  
  // Perfect Day badge
  if (completionRate >= 1.0) {
    unlockedBadges.push('perfect-day');
  }
  
  return unlockedBadges;
}