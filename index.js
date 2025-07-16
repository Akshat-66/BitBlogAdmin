import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import AuthRoute from './routes/Auth.route.js';
import UserRoute from './routes/User.route.js';
import CategoryRoute from './routes/Category.route.js';
import BlogRoute from './routes/Blog.route.js';
import CommentRoute from './routes/Comment.route.js';  // fixed typo here
import BlogLikeRoute from './routes/Bloglike.route.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());

// CORS config
const allowedOrigins = [
  'http://localhost:5173',
  'https://bit-blog.vercel.app',
  'https://bitblogadmin.onrender.com',
  'https://bit-blog-git-main-akshat-tripathis-projects.vercel.app',
  'https://bit-blog-ihfyq79ek-akshat-tripathis-projects.vercel.app',
  'https://bit-blog-sigma.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// --- Add test route for debugging ---
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API test works!' });
});

// Routes
app.use('/api/auth', AuthRoute);
app.use('/api/user', UserRoute);
app.use('/api/category', CategoryRoute);
app.use('/api/blog', BlogRoute);
app.use('/api/comment', CommentRoute);
app.use('/api/blog-like', BlogLikeRoute);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'akshatblog',
  // useNewUrlParser and useUnifiedTopology are no longer needed with latest mongoose version
})
.then(() => console.log('✅ Database connected.'))
.catch(err => console.log('❌ Database connection failed.', err));

// Serve frontend build if you host frontend from backend (optional)
// Uncomment and adjust paths if serving frontend static files from backend
/*
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
  // Serve frontend for any non-API route
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  } else {
    res.status(404).json({ success: false, message: 'API route not found' });
  }
});
*/

// Start server
app.listen(PORT, () => {
  console.log('✅ Server running on port:', PORT);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error.';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message
  });
});
