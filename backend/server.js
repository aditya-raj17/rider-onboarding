const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// In-memory data storage (in production, use a real database)
const tutorials = [
    {
        id: 1,
        title: "Welcome to Delivery Partner Training",
        description: "Get started with your onboarding journey",
        type: "text",
        content: "Welcome! This training will help you understand how to be a successful delivery partner. You'll learn about safety protocols, customer service, and using our delivery app effectively. This comprehensive training covers everything you need to know to start your journey as a delivery partner.",
        estimatedTime: "2 minutes",
        order: 1
    },
    {
        id: 2,
        title: "Safety Guidelines",
        description: "Learn essential safety practices for delivery",
        type: "video",
        content: "https://www.youtube.com/watch?v=sUPKVN-okY0",
        estimatedTime: "5 minutes",
        order: 2
    },
    {
        id: 3,
        title: "App Navigation",
        description: "How to use the delivery app effectively",
        type: "image",
        content: "https://swiggyfood.netlify.app/static/media/dining.817a6301.jpeg",
        estimatedTime: "3 minutes",
        order: 3
    },
    {
        id: 4,
        title: "Customer Service Best Practices",
        description: "Tips for excellent customer interactions",
        type: "text",
        content: "Always greet customers with a smile and maintain a professional demeanor. Be punctual and communicate clearly about delivery times. Handle complaints gracefully and escalate issues when necessary. Remember, you are the face of our company to customers.",
        estimatedTime: "4 minutes",
        order: 4
    }
];

// User progress storage
const userProgress = new Map();

// Routes

// Get all tutorials
app.get('/api/tutorials', (req, res) => {
    try {
        res.json({
            success: true,
            data: tutorials
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tutorials'
        });
    }
});

// Get user progress
app.get('/api/progress/:phoneNumber', (req, res) => {
    try {
        const { phoneNumber } = req.params;
        const progress = userProgress.get(phoneNumber) || {};

        res.json({
            success: true,
            data: progress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch progress'
        });
    }
});

// Save tutorial progress
app.post('/api/progress', (req, res) => {
    try {
        const { phoneNumber, tutorialId, completed, completedAt } = req.body;

        if (!phoneNumber || !tutorialId) {
            return res.status(400).json({
                success: false,
                error: 'Phone number and tutorial ID are required'
            });
        }

        // Get or create user progress
        if (!userProgress.has(phoneNumber)) {
            userProgress.set(phoneNumber, {});
        }

        const progress = userProgress.get(phoneNumber);
        progress[tutorialId] = {
            completed: completed || true,
            completedAt: completedAt || new Date().toISOString()
        };

        userProgress.set(phoneNumber, progress);

        res.json({
            success: true,
            data: progress,
            message: 'Progress saved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to save progress'
        });
    }
});

// Mark training as complete
app.post('/api/training/complete', (req, res) => {
    try {
        const { phoneNumber, completedAt } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }

        // Get user progress
        const progress = userProgress.get(phoneNumber) || {};

        // Check if all tutorials are completed
        const completedTutorials = Object.values(progress).filter(p => p.completed);
        const allCompleted = completedTutorials.length === tutorials.length;

        if (!allCompleted) {
            return res.status(400).json({
                success: false,
                error: 'All tutorials must be completed before marking training as complete'
            });
        }

        // Add training completion record
        progress.trainingCompleted = {
            completed: true,
            completedAt: completedAt || new Date().toISOString()
        };

        userProgress.set(phoneNumber, progress);

        res.json({
            success: true,
            data: progress,
            message: 'Training marked as complete'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to mark training as complete'
        });
    }
});

// Get training statistics
app.get('/api/stats/:phoneNumber', (req, res) => {
    try {
        const { phoneNumber } = req.params;
        const progress = userProgress.get(phoneNumber) || {};

        const completedCount = Object.values(progress).filter(p => p.completed && !p.trainingCompleted).length;
        const totalTutorials = tutorials.length;
        const completionRate = totalTutorials > 0 ? Math.round((completedCount / totalTutorials) * 100) : 0;
        const isTrainingComplete = progress.trainingCompleted?.completed || false;

        res.json({
            success: true,
            data: {
                completedCount,
                totalTutorials,
                completionRate,
                isTrainingComplete,
                lastUpdated: progress.lastUpdated || null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Rider Onboarding API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 ${tutorials.length} tutorials loaded`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📖 API docs: http://localhost:${PORT}/api/tutorials`);
});

module.exports = app; 