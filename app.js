const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const AuthRouter = require('./auth/auth.route');
const BlogRouter = require('./blogs/blogs.route');

const app = express();

app.use(express.json());
app.use(cors());

// connect to DB if not in test
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Routes
app.use('/v1/auth', AuthRouter);
app.use('/v1/blogs', BlogRouter);

module.exports = app;