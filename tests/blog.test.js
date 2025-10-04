const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../auth/auth.model');
const Blog = require('../blogs/blogs.model');

let authToken;
let testUser;
let createdBlogId;

beforeAll(async () => {
  // Clean up first
  await User.deleteMany({});
  await Blog.deleteMany({});

  // Register a user
  await request(app)
    .post('/v1/auth/signup')
    .send({
      first_name: 'Israel',
      last_name: 'Osborn',
      email: 'israelosborn@yahoo.com',
      password: 'password123',
    });

  // Login to get fresh token
  const loginRes = await request(app)
    .post('/v1/auth/login')
    .send({
      email: 'israelosborn@yahoo.com',
      password: 'password123',
    });

  authToken = loginRes.body.token;
  testUser = await User.findOne({ email: 'israelosborn@yahoo.com' });
  
  console.log('Auth token obtained:', authToken ? 'Yes' : 'No');
  console.log('Test user ID:', testUser?._id);
}, 10000);

afterAll(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Blog.deleteMany({});
      await User.deleteMany({});
      await mongoose.connection.close();
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}, 10000);

describe('Blog Endpoints', () => {
  it('should create a new blog', async () => {
    const res = await request(app)
      .post('/v1/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Blog Title',
        description: 'This is a test description',
        body: 'This is the content of the test blog.',
        tags: ['test', 'jest'],
      });

    console.log('Create blog status:', res.statusCode);
    if (res.statusCode !== 201) {
      console.log('Create blog error:', res.body);
    }

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('title', 'Test Blog Title');
    expect(res.body.data).toHaveProperty('description', 'This is a test description');
    expect(res.body.data).toHaveProperty('state', 'draft');
    expect(res.body.data).toHaveProperty('_id');

    createdBlogId = res.body.data._id;
    console.log('Stored createdBlogId:', createdBlogId);
  });

  it('should get a list of published blogs', async () => {
    // Create a published blog first
    const createRes = await request(app)
      .post('/v1/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Published Blog',
        description: 'Desc',
        body: 'Body',
        tags: ['published'],
        state: 'published',
      });

    console.log('Published blog created:', createRes.statusCode);

    const res = await request(app).get('/v1/blogs');

    expect(res.statusCode).toBe(200);
    
    const blogs = res.body.data || res.body.blogs || res.body;
    expect(Array.isArray(blogs)).toBe(true);
    expect(blogs.length).toBeGreaterThan(0);
  });

  it('should get a single blog and increase read_count by 1', async () => {
    // Create and publish a blog
    const createRes = await request(app)
      .post('/v1/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Single Blog',
        description: 'Desc',
        body: 'Body',
        tags: ['single'],
        state: 'published',
      });

    console.log('Single blog create status:', createRes.statusCode);
    
    if (createRes.statusCode !== 201) {
      console.log('Create error:', createRes.body);
    }

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.data).toBeDefined();
    
    const blogId = createRes.body.data._id;
    expect(blogId).toBeDefined();
    console.log('Created blog ID for single test:', blogId);

    // Get the blog (should increment read_count)
    const res = await request(app).get(`/v1/blogs/${blogId}`);

    console.log('Get single blog status:', res.statusCode);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('title', 'Single Blog');
    expect(res.body.data.read_count).toBe(1);
    
    if (res.body.data.author) {
      expect(res.body.data.author).toHaveProperty('email', testUser.email);
    }
  });

  it('should update a blog state to published', async () => {
    console.log('createdBlogId in update test:', createdBlogId);
    console.log('authToken exists:', !!authToken);
    
    expect(createdBlogId).toBeDefined();
    
    const res = await request(app)
      .patch(`/v1/blogs/${createdBlogId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ state: 'published' });

    console.log('Update status:', res.statusCode);
    console.log('Update response:', JSON.stringify(res.body, null, 2));

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('state', 'published');
  });

  it('should delete a blog', async () => {
    console.log('createdBlogId in delete test:', createdBlogId);
    expect(createdBlogId).toBeDefined();
    
    const res = await request(app)
      .delete(`/v1/blogs/${createdBlogId}`)
      .set('Authorization', `Bearer ${authToken}`);

    console.log('Delete response status:', res.statusCode);
    console.log('Delete response body:', res.body);

    expect([200, 204]).toContain(res.statusCode);
  });
});