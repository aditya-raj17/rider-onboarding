# Rider Onboarding Backend API

Backend API server for the Rider Onboarding Training Platform.

## Features

- 📚 Tutorial management
- 📊 Progress tracking
- 👤 User progress by phone number
- ✅ Training completion tracking
- 📈 Statistics and analytics
- 🔒 Secure API endpoints

## Setup

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
PORT=5000
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Tutorials

#### GET /api/tutorials
Get all available tutorials.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Welcome to Delivery Partner Training",
      "description": "Get started with your onboarding journey",
      "type": "text",
      "content": "...",
      "estimatedTime": "2 minutes",
      "order": 1
    }
  ]
}
```

### Progress Tracking

#### GET /api/progress/:phoneNumber
Get user progress by phone number.

**Response:**
```json
{
  "success": true,
  "data": {
    "1": {
      "completed": true,
      "completedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### POST /api/progress
Save tutorial progress.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "tutorialId": 1,
  "completed": true,
  "completedAt": "2024-01-15T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "1": {
      "completed": true,
      "completedAt": "2024-01-15T10:30:00Z"
    }
  },
  "message": "Progress saved successfully"
}
```

### Training Completion

#### POST /api/training/complete
Mark training as complete.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "completedAt": "2024-01-15T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trainingCompleted": {
      "completed": true,
      "completedAt": "2024-01-15T10:30:00Z"
    }
  },
  "message": "Training marked as complete"
}
```

### Statistics

#### GET /api/stats/:phoneNumber
Get training statistics for a user.

**Response:**
```json
{
  "success": true,
  "data": {
    "completedCount": 5,
    "totalTutorials": 5,
    "completionRate": 100,
    "isTrainingComplete": true,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

### Health Check

#### GET /api/health
Check API health status.

**Response:**
```json
{
  "success": true,
  "message": "Rider Onboarding API is running",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

## Tutorial Types

### Text Tutorial
```json
{
  "type": "text",
  "content": "Your text content here..."
}
```

### Video Tutorial
```json
{
  "type": "video",
  "content": "https://example.com/video.mp4"
}
```

### Image Tutorial
```json
{
  "type": "image",
  "content": "https://example.com/image.jpg"
}
```

### Quiz Tutorial
```json
{
  "type": "quiz",
  "content": {
    "questions": [
      {
        "id": 1,
        "question": "What is the correct answer?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 1
      }
    ]
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running in Production
```bash
npm start
```

## Production Considerations

- Replace in-memory storage with a real database (MongoDB, PostgreSQL, etc.)
- Add authentication and authorization
- Implement rate limiting
- Add request validation
- Set up proper logging
- Configure CORS for production domains
- Add API documentation (Swagger/OpenAPI)

## License

MIT 