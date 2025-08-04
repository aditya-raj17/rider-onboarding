# Rider Onboarding Training Platform

A mobile-first web application for delivering onboarding training tutorials to delivery partners. Built with React and Vite for optimal performance and user experience.

## Features

- 📱 **Mobile-First Design**: Optimized for mobile devices with responsive design
- 📞 **Phone Number Authentication**: Simple phone number entry to track progress
- 🎯 **Progress Tracking**: Real-time progress tracking with visual indicators
- 📚 **Multiple Content Types**: Support for text, video, image, and quiz tutorials
- ✅ **Completion Tracking**: Automatic progress saving and completion status
- 🏆 **Completion Certificate**: Achievement summary and certificate download
- ⚡ **Lightweight & Fast**: Built with Vite for optimal performance
- 🔄 **Offline Support**: Progress saved locally with sync capabilities

## Tutorial Types Supported

1. **Text Tutorials**: Written instructions and guidelines
2. **Video Tutorials**: Embedded video content with progress tracking
3. **Image Tutorials**: Visual guides and infographics
4. **Quiz Tutorials**: Interactive assessments with scoring

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rider_onboarding
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── PhoneEntry.jsx   # Phone number entry screen
│   ├── TutorialList.jsx # Tutorial overview and progress
│   ├── TutorialView.jsx # Individual tutorial viewer
│   └── CompletionScreen.jsx # Completion certificate
├── context/             # React context for state management
│   └── TutorialContext.jsx
├── App.jsx              # Main application component
├── main.jsx            # Application entry point
└── index.css           # Global styles
```

## API Integration

The application is designed to work with a backend API. Currently, it uses mock data and localStorage for demonstration purposes. To integrate with your backend:

1. Update the `API_BASE_URL` in `src/context/TutorialContext.jsx`
2. Uncomment the API calls in the context file
3. Implement the following endpoints:

### Required API Endpoints

- `GET /tutorials` - Fetch all tutorials
- `GET /progress/{phoneNumber}` - Get user progress
- `POST /progress` - Save tutorial progress
- `POST /training/complete` - Mark training as complete

### API Request/Response Examples

#### Save Progress
```javascript
POST /progress
{
  "phoneNumber": "+1234567890",
  "tutorialId": 1,
  "completed": true,
  "completedAt": "2024-01-15T10:30:00Z"
}
```

#### Mark Training Complete
```javascript
POST /training/complete
{
  "phoneNumber": "+1234567890",
  "completedAt": "2024-01-15T10:30:00Z"
}
```

## Customization

### Adding New Tutorials

Update the `mockTutorials` array in `src/context/TutorialContext.jsx`:

```javascript
{
  id: 6,
  title: "New Tutorial Title",
  description: "Tutorial description",
  type: "text", // or "video", "image", "quiz"
  content: "Tutorial content or URL",
  estimatedTime: "5 minutes",
  order: 6
}
```

### Styling

The application uses CSS custom properties for theming. Update the variables in `src/index.css`:

```css
:root {
  --primary-color: #2563eb;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  /* ... other variables */
}
```

### Tutorial Content Types

#### Text Tutorial
```javascript
{
  type: "text",
  content: "Your text content here..."
}
```

#### Video Tutorial
```javascript
{
  type: "video",
  content: "https://example.com/video.mp4"
}
```

#### Image Tutorial
```javascript
{
  type: "image",
  content: "https://example.com/image.jpg"
}
```

#### Quiz Tutorial
```javascript
{
  type: "quiz",
  content: {
    questions: [
      {
        id: 1,
        question: "What is the correct answer?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 1
      }
    ]
  }
}
```

## Performance Optimizations

- **Code Splitting**: Automatic code splitting with Vite
- **Lazy Loading**: Images and videos load on demand
- **Minification**: Production builds are minified and optimized
- **Caching**: Progress data cached locally
- **Responsive Images**: Optimized for different screen sizes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository. 