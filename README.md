A RESTful API for creating and managing blog posts with user authentication.

FEATURES:

User registration and authentication with JWT

Create, Read, Update, and Delete blog posts

Draft and published states for blogs

Automatic reading time calculation

Read count tracking

Filter and search blogs by title, author, and tags

Pagination and sorting

Private drafts (only visible to author)

API   Endpoints:

Base URL: https://blogging-api-7sc7.onrender.com

Authentication:

Register a New User:

POST /v1/auth/signup

Request Body:

{

  "first_name": "John",
  
  "last_name": "Doe",
  
  "email": "john@example.com",
  
  "password": "password123"
  
}

Login:

POST /v1/auth/login

Request Body:

{

  "email": "john@example.com",
  
  "password": "password123"
  
}


Blog Post

Create a Blog Post:

POST /v1/blogs

Authorization: Bearer <token>

Request Body:

{

  "title": "My First Blog Post",
  
  "description": "A short description of the post",
  
  "body": "The full content of the blog post goes here...",
  
  "tags": "technology, tutorial",
  
  "state": "draft"
  
}

Get all published blogs:

GET /v1/blogs

Query Parameters:

orderBy: Sort field - "read_count", "reading_time", or "createdAt" (default: "createdAt")

order: Sort order - "asc" or "desc" (default: "desc")

author: Filter by author name

title: Search in title (case-insensitive)

tags: Filter by tags (comma-separated)

Example:

GET /v1/blogs?author=name

Get a single blog:

GET /v1/blogs/:id

Notes:

Increments read_count by 1 on each view.
Published blogs are visible to everyone.
Draft blogs are only visible to their author.

Get my blogs:

GET /v1/blogs/my-blogs

Authorization: Bearer <token>

Query Parameters:

Same as "Get All Blogs" plus:

state (optional): Filter by state - "draft" or "published"

Update Blog:

PATCH /v1/blogs/:id

Authorization: Bearer <token>

Request Body (all fields optional):

{

  "title": "Updated Title",
  
  "description": "Updated description",
  
  "body": "Updated content",
  
  "tags": "updated, tags",
  
  "state": "published"
  
}

Notes:

Only the author can update their blog.
You can update one or more fields.

Delete A Blog:

DELETE /v1/blogs/:id

Authorization: Bearer <token>

Notes:

Only the author can delete their blog

Common Status Codes:

200 OK - Successful GET, PATCH, DELETE

201 Created - Successful POST

400 Bad Request - Invalid input

401 Unauthorized - Missing or invalid token

403 Forbidden - Not authorized to access resource

404 Not Found - Resource not found

500 Internal Server Error - Server error

Features Explained

Reading Time:

The API automatically calculates reading time based on word count (approximately 200 words per minute).

Read Count:

Each time a blog is viewed (via GET /v1/blogs/:id), the read_count increments by 1. The author's views don't count.

Draft vs Published

Draft: Only visible to the author. Not shown in public listings.

Published: Visible to everyone. Shown in public listings.

Authentication:
Protected routes require a JWT token in the Authorization header.

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
