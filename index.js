import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';

import AuthRoute from './routes/Auth.route.js';
import UserRoute from './routes/User.route.js';
import CategoryRoute from './routes/Category.route.js';
import BlogRoute from './routes/Blog.route.js';
import CommentRouote from './routes/Comment.route.js';
import BlogLikeRoute from './routes/Bloglike.route.js';

dotenv.config();

const PORT = process.env.PORT;
const app = express();

app.use(cookieParser());
app.use(express.json());

// ✅ Proper CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://bit-blog.vercel.app',
  'https://bitblogadmin.onrender.com',
  'https://bit-blog-git-main-akshat-tripathis-projects.vercel.app',
  'https://bit-blog-ihfyq79ek-akshat-tripathis-projects.vercel.app',
  'https://bit-blog-sigma.vercel.app' // ✅ This is important!
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ Routes
app.use('/api/auth', AuthRoute);
app.use('/api/user', UserRoute);
app.use('/api/category', CategoryRoute);
app.use('/api/blog', BlogRoute);
app.use('/api/comment', CommentRouote);
app.use('/api/blog-like', BlogLikeRoute);

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, { dbName: 'yt-mern-blog' })
  .then(() => console.log('✅ Database connected.'))
  .catch(err => console.log('❌ Database connection failed.', err));

// ✅ Start server
app.listen(PORT, () => {
  console.log('✅ Server running on port:', PORT);
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error.';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message
  });
});
