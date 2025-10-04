const express = require('express');
const BlogController = require('./blogs.controller');
// const BlogMiddleware = require('./blogs.middleware');
const { authMiddleware, optionalAuth } = require('../auth/auth.middleware');

const BlogRouter = express.Router();



BlogRouter.post('/', authMiddleware, BlogController.CreateBlogController)
BlogRouter.get('/', optionalAuth, BlogController.GetAllBlogsController)
BlogRouter.patch('/:id', authMiddleware, BlogController.UpdateBlogController)
BlogRouter.delete('/:id', authMiddleware, BlogController.DeleteBlogController)
BlogRouter.get('/my-blogs', authMiddleware, BlogController.GetAllBlogsByUserController)
BlogRouter.get('/:id', optionalAuth, BlogController.GetSingleBlogController)


module.exports = BlogRouter;