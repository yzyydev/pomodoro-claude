import { OpenAI } from 'openai';
import { FocusRecommendation } from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { task } = await request.json();

    if (!task || !task.title || !task.description) {
      return Response.json(
        { error: 'Task title and description are required' },
        { status: 400 }
      );
    }

    const prompt = `
      You are an AI productivity assistant specializing in the Pomodoro technique.
      
      Below is a task that a user wants to work on. Based on the task description:
      1. Recommend an optimal Pomodoro session duration (between 15-45 minutes)
      2. Recommend a break duration (between 5-15 minutes)
      3. Explain your reasoning briefly
      4. Provide a confidence score (0-1) for your recommendation
      
      Task title: ${task.title}
      Task description: ${task.description}
      
      Respond in JSON format exactly like this:
      {
        "recommendedDuration": number,
        "breakDuration": number,
        "reasoning": "string",
        "confidenceScore": number
      }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: 'You are a productivity AI assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const recommendation: FocusRecommendation = JSON.parse(content);

    return Response.json(recommendation);
  } catch (error) {
    console.error('Error generating focus recommendation:', error);
    return Response.json(
      { error: 'Failed to generate recommendation' },
      { status: 500 }
    );
  }
}