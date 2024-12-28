const Post = require('../../models/Post/postModel');
const Category = require('../../models/Category/categoryModel');
const Topic = require('../../models/Topic/topicModel');
const POST_LIST_PROJECTION = {
  components: 0,
  longDescription: 0
};

// Create new post
const createPost = async (req, res) => {
  try {
    const { categoryId, categoryPath, topicId, features, Placement, ...postData } = req.body;

    const post = new Post({
      ...postData,
      category: categoryId,
      categoryPath: categoryPath || [categoryId],
      topic: topicId,
      displayedWithin: features,
      placementTags: Placement,
    });

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate({
        path: 'category',
        populate: {
          path: 'parentCategory',
          populate: {
            path: 'parentCategory'
          }
        }
      })
      .populate('categoryPath')
      .populate({
        path: 'topic',
        populate: {
          path: 'category',
          populate: {
            path: 'parentCategory',
            populate: {
              path: 'parentCategory'
            }
          }
        }
      });

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get all posts with filters
const getPosts = async (req, res) => {
  try {
    const { status, category, topic, includeDrafts } = req.query;

    const query = {};
    if (!includeDrafts) {
      query.status = { $ne: 'draft' }; // Exclude drafts by default
    }
    if (status) query.status = status; // Override specific status filtering
    if (category) query.category = category;
    if (topic) query.topic = topic;

    const posts = await Post.find(query, POST_LIST_PROJECTION)
      .populate({
        path: 'category',
        populate: {
          path: 'parentCategory',
          populate: {
            path: 'parentCategory'
          }
        }
      })
      .populate('topic')
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get post by ID
const getPostById = async (req, res) => {
  try {
    const { includeDrafts } = req.query; // Extract the query parameter

    // console.log("includeDrafts query param:", includeDrafts); // Log the query parameter

    // Build the query based on whether the includeDrafts parameter is set
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: req.params.id }
      : { slug: req.params.id };

    if (!includeDrafts) {
      query.status = { $ne: 'draft' }; // Exclude drafts by default
    }

    const post = await Post.findOne(query)
      .populate({
        path: 'category',
        populate: {
          path: 'parentCategory',
          populate: {
            path: 'parentCategory'
          }
        }
      })
      .populate('topic');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update post
const updatePost = async (req, res) => {
  try {
    const existingPost = await Post.findById(req.params.id);
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (req.body.slug) {
      req.body.slug = req.body.slug.split('-').slice(0, -1).join('-');
    }
    Object.assign(existingPost, {
      ...req.body,
      uniqueIdentifier: existingPost.uniqueIdentifier,
      updatedAt: Date.now()
    });
    await existingPost.save();
    const updatedPost = await Post.findById(existingPost._id)
      .populate({
        path: 'category',
        populate: {
          path: 'parentCategory',
          populate: {
            path: 'parentCategory'
          }
        }
      })
      .populate('topic');
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get posts by category and optional subcategory slugs
const getPostsByCategory = async (req, res) => {
  try {
    const { categorySlug, subcategorySlug } = req.params;
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    let query = {
      category: category._id,
      topic: null,
      status: { $ne: 'draft' } // Exclude drafts
    };

    if (subcategorySlug) {
      const subcategory = await Category.findOne({
        slug: subcategorySlug,
        parentCategory: category._id
      });

      if (!subcategory) {
        return res.status(404).json({ error: 'Subcategory not found' });
      }
      query.category = subcategory._id;
    }

    const posts = await Post.find(query, POST_LIST_PROJECTION)
      .populate({
        path: 'category',
        populate: {
          path: 'parentCategory',
          populate: {
            path: 'parentCategory'
          }
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPostBySlug = async (req, res) => {
  try {
    // Get all path segments except the last one (which is the post slug)
    const pathSegments = req.params[0].split('/');
    const postSlug = pathSegments.pop(); // Remove and get the last segment (blog slug)
    const categoryPath = pathSegments; // Remaining segments are category path

    // Traverse the category path to get the final category
    let currentCategory = null;
    let parentId = null;

    for (const slug of categoryPath) {
      const category = await Category.findOne({
        slug,
        ...(parentId ? { parentCategory: parentId } : { parentCategory: null })
      });

      if (!category) {
        return res.status(404).json({ error: 'Category path not found' });
      }

      currentCategory = category;
      parentId = category._id;
    }

    if (!currentCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Find the post in the final category
    const post = await Post.findOne({
      slug: postSlug,
      category: currentCategory._id
    }).populate({
      path: 'category',
      populate: {
        path: 'parentCategory',
        populate: {
          path: 'parentCategory'
        }
      }
    }).populate('topic');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getTopicsByCategory = async (req, res) => {
  try {
    const { categorySlug, subcategorySlug } = req.params;

    // Find category
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Find subcategory if provided
    let categoryId = category._id;
    if (subcategorySlug) {
      const subcategory = await Category.findOne({
        slug: subcategorySlug,
        parentCategory: category._id
      });
      if (subcategory) {
        categoryId = subcategory._id;
      }
    }

    // Find all topics for this category/subcategory
    const topics = await Topic.find({ category: categoryId });

    res.status(200).json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// postController.js
const getPostsByCategoryAndTopic = async (req, res) => {
  try {
    const { categorySlug, subcategorySlug, topicId } = req.params;
    const query = { topic: topicId };

    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (subcategorySlug) {
      const subcategory = await Category.findOne({
        slug: subcategorySlug,
        parentCategory: category._id
      });

      if (!subcategory) {
        return res.status(404).json({ error: 'Subcategory not found' });
      }
      query.category = subcategory._id;
    } else {
      query.category = category._id;
    }

    const posts = await Post.find(query, POST_LIST_PROJECTION)
      .populate({
        path: 'category',
        populate: {
          path: 'parentCategory',
          populate: {
            path: 'parentCategory'
          }
        }
      })
      .populate('topic')
      .sort({ createdAt: -1 });

    // Filter posts to only include those with status "published"
    const publishedPosts = posts.filter(post => post.status === 'published');

    res.status(200).json(publishedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getCategoryBlogsWithTopics = async (req, res) => {
  try {
    const { includeDrafts } = req.query;

    // 1. Get the category path
    const category = await Category.findOne({
      slug: 'meta-description' // Parent category
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const subcategory = await Category.findOne({
      slug: 'meta-description edited-2', // Child category
      parentCategory: category._id
    });

    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    // 2. Get all topics under this subcategory
    const topics = await Topic.find({
      category: subcategory._id
    });

    // 3. Fetch blogs for each topic and blogs without topics
    const result = {
      categoryInfo: {
        name: subcategory.name,
        slug: subcategory.slug,
        parentCategory: {
          name: category.name,
          slug: category.slug
        }
      },
      topicBlogs: [],
      generalBlogs: [] // blogs without topics
    };

    // Get blogs without topics
    const generalBlogsQuery = {
      category: subcategory._id,
      topic: null
    };
    if (!includeDrafts) {
      generalBlogsQuery.status = { $ne: 'draft' }; // Exclude drafts by default
    }
    const generalBlogs = await Post.find(generalBlogsQuery).populate({
      path: 'category',
      populate: {
        path: 'parentCategory'
      }
    });

    result.generalBlogs = generalBlogs;

    // Get blogs for each topic
    const topicBlogsPromises = topics.map(async (topic) => {
      const topicBlogsQuery = {
        category: subcategory._id,
        topic: topic._id
      };
      if (!includeDrafts) {
        topicBlogsQuery.status = { $ne: 'draft' }; // Exclude drafts by default
      }
      const blogs = await Post.find(topicBlogsQuery).populate({
        path: 'category',
        populate: {
          path: 'parentCategory'
        }
      }).populate('topic');

      return {
        topic: {
          name: topic.topicName,
          _id: topic._id
        },
        blogs
      };
    });

    result.topicBlogs = await Promise.all(topicBlogsPromises);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getCategoryHierarchyBlogs = async (req, res) => {
  try {
    const slugs = req.params.slugs.split('/').filter(Boolean);

    // Helper function to get category data recursively
    const getCategoryData = async (slug, parentId = null) => {
      const category = await Category.findOne({
        slug,
        ...(parentId && { parentCategory: parentId })
      });

      if (!category) {
        return null;
      }

      // Get topics for this category
      const topics = await Topic.find({ category: category._id });

      // Get posts without topics
      const topiclessBlogs = await Post.find({
        category: category._id,
        topic: null
      }).populate({
        path: 'category',
        populate: {
          path: 'parentCategory',
          populate: { path: 'parentCategory' }
        }
      });

      // Get posts for each topic
      const topicBlogs = await Promise.all(
        topics.map(async (topic) => ({
          topic: {
            _id: topic._id,
            name: topic.topicName,
            slug: topic.slug
          },
          posts: await Post.find({
            category: category._id,
            topic: topic._id
          }).populate({
            path: 'category',
            populate: {
              path: 'parentCategory',
              populate: { path: 'parentCategory' }
            }
          }).populate('topic')
        }))
      );

      // Get subcategories if this isn't the last category in path
      const subcategories = await Category.find({ parentCategory: category._id });
      const subcategoryData = await Promise.all(
        subcategories.map(sub => getCategoryData(sub.slug, category._id))
      );

      return {
        category: {
          _id: category._id,
          name: category.name,
          slug: category.slug
        },
        topiclessBlogs,
        topicBlogs,
        subcategories: subcategoryData.filter(Boolean)
      };
    };

    // Start from first slug
    const result = await getCategoryData(slugs[0]);

    if (!result) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getAllBlogsByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const { includeDrafts } = req.query;

    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const query = { category: category._id };
    if (!includeDrafts) {
      query.status = { $ne: 'draft' }; // Exclude drafts by default
    }

    const blogs = await Post.find(query, POST_LIST_PROJECTION)
      .populate({
        path: 'category',
        populate: {
          path: 'parentCategory',
          populate: {
            path: 'parentCategory'
          }
        }
      })
      .populate('topic');

    const topicBlogs = {};
    const generalBlogs = [];

    blogs.forEach(blog => {
      if (blog.topic) {
        if (!topicBlogs[blog.topic._id]) {
          topicBlogs[blog.topic._id] = {
            topic: blog.topic,
            blogs: []
          };
        }
        topicBlogs[blog.topic._id].blogs.push(blog);
      } else {
        generalBlogs.push(blog);
      }
    });

    res.status(200).json({
      categoryInfo: category,
      topicBlogs: Object.values(topicBlogs),
      generalBlogs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostBySlug,
  getPostsByCategory,
  getTopicsByCategory,
  getPostsByCategoryAndTopic,
  getCategoryBlogsWithTopics,
  getCategoryHierarchyBlogs,
  getAllBlogsByCategory
};