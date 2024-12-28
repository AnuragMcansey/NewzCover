require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const compression = require('compression');
const morgan = require('morgan');
const categoryRoutes = require('./routes/Category/categoryRoutes');
const tagRoutes = require('./routes/tag/tagRoutes');
const commentRoutes = require('./routes/comment/commentRoutes');
const uploadRoutes = require('./routes/media/mediaRoutes');
const adRoutes = require('./routes/ads/adsRoute');
const authorRoute = require('./routes/author/authorRoute');
const schedulerService = require('./services/schedulerService');
const topicRoute = require('./routes/Topic/topicRoutes');
const postRoutes = require('./routes/Post/postRoutes');
const webStoryRoutes = require('./routes/webstory/webStoryRoute');
const webStoryCategoryRoutes = require('./routes/webstory/webStoryCategoryRoute');
const placementRoutes = require('./routes/Placement/PlacementRoute');
const path = require('path');
const app = express();

// Initialize scheduler service
schedulerService.init();

// Enable gzip compression
app.use(compression());

// Use morgan for logging HTTP requests
// app.use(morgan('combined'));

app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; img-src https://res.cloudinary.com; script-src 'self'; style-src 'self'"
    );
    next();
});

const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:3000', 'https://theflique.com'];
// const allowedOrigins = [process.env.CLIENT_URL, 'https://theflique.com'];

// app.use(cors())
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'], // Allow these HTTP methods
    credentials: true, // Allow credentials if needed
}));

// Parse JSON bodies
app.use(express.json());

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error('MongoDB URI is not defined in environment variables');
    process.exit(1);
}

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => {
        console.error('MongoDB connection error: ', err);
        process.exit(1);
    });

// Serve static files efficiently
app.use(express.static(path.join(__dirname, 'theflique-frontend-main/build')));
app.use('/uploads', express.static('uploads'));

// Define routes
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/author', authorRoute);
app.use('/api/comments', commentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/topics', topicRoute);
app.use('/api/posts', postRoutes);
app.use('/api/web-stories', webStoryRoutes);
app.use('/api/web-story-categories', webStoryCategoryRoutes);
app.use('/api/placement', placementRoutes);

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});