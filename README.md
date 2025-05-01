# Pomodoro Focus - AI-Powered Productivity App

Pomodoro Focus is an AI-first productivity application that leverages OpenAI's API to provide intelligent task duration recommendations, comprehensive productivity metrics, and gamified progression to keep you motivated.

## Features

### 🧠 AI Focus Engine

The core of Pomodoro Focus is its intelligent task-aware timer:

- **Smart Duration Recommendations**: Analyzes your task description and provides optimal focus session durations
- **Personalized Break Timers**: Recommends appropriate break lengths based on your work intensity
- **Explanation Insights**: Get reasoning behind each recommendation to understand your work patterns

### 📊 Comprehensive Dashboard

Track your productivity journey with detailed metrics:

- **Focus Time Tracking**: Monitor daily, weekly, and monthly focus time
- **Session Completion Rate**: See your success rate for completing Pomodoro sessions
- **Productivity Trends**: Visualize your productivity patterns over time

### 🎮 Gamified Progression

Stay motivated with engaging game mechanics:

- **Experience Points (XP)**: Earn XP for completed sessions
- **Streak System**: Build and maintain daily streaks
- **Achievement Badges**: Unlock badges for reaching productivity milestones
- **Level Progression**: Level up as you accumulate XP

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- OpenAI API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pomodoro-focus.git
   cd pomodoro-focus
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create an `.env.local` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to access the application

## Tech Stack

- **Frontend**: Next.js 15, React 19
- **AI Integration**: OpenAI Node SDK v4.96.0+ using gpt-4o-mini
- **State Management**: Zustand
- **Data Visualization**: Chart.js with react-chartjs-2
- **Styling**: Tailwind CSS
- **TypeScript**: For type safety and better developer experience

## Architecture

Pomodoro Focus follows a modern architecture with:

- **Server Components**: For data-fetching operations
- **Client Components**: For interactive elements
- **Server Actions**: To handle API calls and data operations
- **Local Storage**: For persistence of user data and preferences

## Customization

### Changing the Theme

The application uses Tailwind CSS with customized colors. You can modify the color scheme in `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: { /* your primary color palette */ },
      focus: { DEFAULT: '#ef4444' }, // Color for focus sessions
      break: { DEFAULT: '#22c55e' }, // Color for break sessions
    }
  }
}
```

### Modifying AI Model

By default, the application uses `gpt-4o-mini` for cost-efficient scheduling. To use a more powerful model:

1. Open `src/app/api/ai-focus/route.ts`
2. Change the model parameter:
   ```typescript
   const response = await openai.chat.completions.create({
     model: 'gpt-4.5-turbo', // Change to desired model
     // other parameters...
   });
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The Pomodoro Technique® by Francesco Cirillo
- OpenAI for their powerful API
- Next.js team for an excellent framework

---

## Future Enhancements

- Mobile app with cross-platform sync
- Integration with calendar and task management apps
- Advanced analytics with AI-powered insights
- Collaborative features for teams
- Custom sound themes for focus/breaks