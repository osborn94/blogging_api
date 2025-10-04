const BlogModel = require("./blogs.model");

const CreateBlog = async ({
  title,
  author,
  description,
  state,
  read_count,
  reading_time,
  tags,
  body,
}) => {
  // create the blog
  const blog = await BlogModel.create({
    title,
    author,
    description,
    state,
    read_count,
    reading_time,
    tags,
    body,
  });

  // re-fetch with populated author details
  const populatedBlog = await BlogModel.findById(blog._id).populate(
    "author",
    "first_name last_name email"
  );

  // FIX: Return just the blog, not wrapped in { data: ... }
  return populatedBlog;
};

const GetAllBlogs = async ({
  author,
  title,
  tags,
  orderBy,
  order,
  page,
  limit,
  user,
}) => {
  let query;

  if (user) {
    // Logged in → see all published blogs + their own drafts
    query = {
      $or: [
        { state: "published" },
        { state: "draft", author: user._id }, // only their drafts
      ],
    };
  } else {
    // Not logged in → only published
    query = { state: "published" };
  }

  if (title) {
    query.title = { $regex: new RegExp(title, "i") };
  }

  if (tags) {
    query.tags = {
      $in: tags.split(",").map((tag) => new RegExp(tag.trim(), "i")),
    };
  }

  // Sorting
  let sort = {};
  if (orderBy) {
    const sortField = ["read_count", "reading_time", "createdAt"].includes(
      orderBy
    )
      ? orderBy
      : "createdAt";
    sort[sortField] = order === "asc" ? 1 : -1;
  } else {
    sort = { createdAt: -1 };
  }

  // Pagination
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const skip = (pageNum - 1) * limitNum;

  const total = await BlogModel.countDocuments(query);

  let blogs = await BlogModel.find(query)
    .populate("author", "first_name last_name email")
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  if (author) {
    const regex = new RegExp(author, "i");
    blogs = blogs.filter(
      (b) =>
        regex.test(b.author.first_name) ||
        regex.test(b.author.last_name) ||
        regex.test(b.author.email)
    );
  }

  return {
    code: 200,
    message: "Blogs fetched successfully",
    data: blogs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

// logged in user can only get the list of blogs they created (i.e. my blogs)
const GetAllBlogsByUser = async ({
  title,
  tags,
  state,
  orderBy,
  order,
  page,
  limit,
  user,
}) => {
  // Ensure user is logged in
  if (!user) {
    return {
      code: 401,
      message: "Unauthorized. You must be logged in to view your blogs.",
    };
  }

  // Base query: only blogs authored by the logged-in user
  const query = { author: user._id };

  // state filtering
  if (state) {
    query.state = state;
  }

  // title search
  if (title) {
    query.title = { $regex: new RegExp(title, "i") };
  }

  // tags search
  if (tags) {
    query.tags = {
      $in: tags.split(",").map((tag) => new RegExp(tag.trim(), "i")),
    };
  }

  // Sorting
  let sort = {};
  if (orderBy) {
    const sortField = ["read_count", "reading_time", "createdAt"].includes(
      orderBy
    )
      ? orderBy
      : "createdAt";
    sort[sortField] = order === "asc" ? 1 : -1;
  } else {
    sort = { createdAt: -1 };
  }

  // Pagination
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const skip = (pageNum - 1) * limitNum;

  // Get total count for pagination
  const total = await BlogModel.countDocuments(query);

  // Fetch blogs
  const blogs = await BlogModel.find(query)
    .populate("author", "first_name last_name email")
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  return {
    code: 200,
    message: "User blogs fetched successfully",
    data: blogs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

// update blog
const UpdateBlog = async (blogId, updateData, authorId) => {
  const { state, title, body, tags, description } = updateData;

  // Validate state only if provided
  if (state && !["draft", "published"].includes(state)) {
    return {
      code: 400,
      message: "Invalid status. Must be either draft or published.",
    };
  }

  // update object dynamically
  const updateFields = {};
  if (state) updateFields.state = state;
  if (title) updateFields.title = title;
  if (body) updateFields.body = body;
  if (tags) updateFields.tags = tags;
  if (description) updateFields.description = description;

  console.log("blogId:", blogId);
  console.log("updateFields:", updateFields);
  const blog = await BlogModel.findOneAndUpdate(
    { _id: blogId, author: authorId }, // match both blogId and author
    updateFields,
    { new: true }
  );

  if (!blog) {
    return {
      code: 404,
      message: "blog not found",
    };
  }

  return {
    code: 200,
    message: "Blog updated successfully",
    data: blog,
  };
};

// delete blog
const DeleteBlog = async (blogId, authorId) => {
  const blog = await BlogModel.findOneAndDelete({
    _id: blogId,
    author: authorId,
  });

  if (!blog) {
    return {
      code: 404,
      message: "Blog not found",
    };
  }

  return {
    code: 200,
    message: "Blog deleted successfully",
  };
};

// Get single blog
const GetSingleBlog = async (blogId, user) => {
  // Find the blog and populate author details
  const blog = await BlogModel.findById(blogId).populate(
    "author",
    "first_name last_name email"
  );

  if (!blog) {
    return {
      code: 404,
      message: "Blog not found",
    };
  }

  // Check state:
  // - If it's published, anyone can view it.
  // - If it's draft, only the author can view it.
  if (
    blog.state === "draft" &&
    (!user || blog.author._id.toString() !== user._id.toString())
  ) {
    return {
      code: 403,
      message: "You are not authorized to view this draft blog",
    };
  }

  // Increment read count if the viewer is not the author
  if (!user || blog.author._id.toString() !== user._id.toString()) {
    blog.read_count += 1;
    await blog.save();
  }

  return {
    code: 200,
    message: "Blog fetched successfully",
    data: blog,
  };
};

module.exports = {
  CreateBlog,
  GetAllBlogs,
  GetAllBlogsByUser,
  UpdateBlog,
  DeleteBlog,
  GetSingleBlog,
};