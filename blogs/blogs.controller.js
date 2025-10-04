const BlogService = require("./blogs.service");
const estimateReadingTime = require("../utils/readingTime");

const CreateBlogController = async (req, res) => {
  try {
    const { title, description, state, tags, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        status: "error",
        message: "Title, author, and body are required fields",
      });
    }

    // Auto-generate fields
    const read_count = 0;
    const reading_time = estimateReadingTime(body);

    // Default state
    const blogState = state || "draft"; // only allow 'draft' or 'published'

    // Call service to create blog
    const blog = await BlogService.CreateBlog({
      title,
      // author: req.user.id,
      author: req.user._id,
      description,
      state: blogState,
      read_count,
      reading_time,
      tags,
      body,
    });

    return res.status(201).json({
      status: "success",
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong while creating the blog",
    });
  }
};

const GetAllBlogsController = async (req, res) => {
  try {
    const { author, title, tags, orderBy, order, page, limit } = req.query;

    const response = await BlogService.GetAllBlogs({
      author,
      title,
      tags,
      orderBy,
      order,
      page,
      limit,
      user: req.user || null, // will be set by JWT auth middleware if logged in
    });

    return res.status(response.code).json({
      status: "success",
      message: response.message,
      data: response.data,
      pagination: response.pagination,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({
      status: "error",
      message: "Error fetching blogs",
    });
  }
};

// get all blogs created by the logged in user only
const GetAllBlogsByUserController = async (req, res) => {
  try {
    const response = await BlogService.GetAllBlogsByUser({
      ...req.query,
      user: req.user,
    });


    return res.status(response.code).json({
      status: "success",
      message: response.message,
      data: response.data,
      pagination: response.pagination,
    });
  } catch (error) {
    console.error("GetAllBlogsByUserController Error:", error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

// update blog controller
const UpdateBlogController = async (req, res) => {
  try {
    const { id } = req.params;
    const { state, title, body, tags, description } = req.body;

    const response = await BlogService.UpdateBlog(
      id,
      { state, title, body, tags, description },
      req.user._id
    );

    if (response.code === 200) {
      return res.status(200).json({
        status: "success",
        message: response.message,
        data: response.data,
      });
    } else {
      return res.status(response.code).json({
        status: "error",
        message: response.message,
      });
    }
  } catch (error) {
    console.error("UpdateBlogController Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

const DeleteBlogController = async (req, res) => {
  try {
    const { id } = req.params;

    const author = req.user._id;

    const response = await BlogService.DeleteBlog(id, author);

    if (response.code === 200) {
      return res.status(200).json({
        status: "success",
        message: response.message,
        data: response.data,
      });
    } else {
      return res.status(response.code).json({
        status: "error",
        message: response.message,
      });
    }
  } catch (error) {
    console.error("DeleteBlogController Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

// Get single blog
const GetSingleBlogController = async (req, res) => {
  try {
    const blogId = req.params.blogId || req.params.id;
    console.log(
      "GET single blog - params:",
      req.params,
      "user:",
      req.user && req.user._id
    );

    const response = await BlogService.GetSingleBlog(blogId, req.user || null);
    
    if (response.code === 200) {
      return res.status(200).json({
        status: "success",
        message: response.message,
        data: response.data,
      });
    } else {
      return res.status(response.code).json({
        status: "error",
        message: response.message,
      });
    }
  } catch (err) {
    console.error("GetSingleBlogController Error:", err);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

module.exports = {
  CreateBlogController,
  GetAllBlogsController,
  GetAllBlogsByUserController,
  UpdateBlogController,
  DeleteBlogController,
  GetSingleBlogController,
};
