const mongoose = require('mongoose');
const slugify = require('slugify'); // Recommended for robust slug generation
const { v4: uuidv4 } = require('uuid');

// Component Schema (already defined in your model)
const componentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: false,
    enum: ['Image', 'CodeBlock', 'TextEditor']
  },
  props: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  }
});

// Post Schema with enhanced slug generation and validation
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: false,
    unique: true,
    trim: true,
    lowercase: true
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  longDescription: String,
  featuredImage: String,
  featuredImageAlt: String,
  bannerImage: String,
  bannerImageAlt: String,
  metaTitle: {
    type: String,
    maxlength: [60, 'Meta title cannot exceed 60 characters']
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  metaKeywords: [String],
  author: {
    type: String,
    default: 'Admin'
  },
  components: [componentSchema],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  categoryPath: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  displayedWithin: [
    {
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false,
      },
      subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false,
      },
      subsubcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false,
      },
    },
  ],
  placementTags: {
    type: [String],
    default: []
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: false
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published'],
    default: 'draft'
  },
  publishDate: {
    type: Date,
    default: null
  },
  features: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  fullPathSlug: {
    type: String,
    unique: true,
    lowercase: true
  },
  uniqueIdentifier: {
    type: String,
    default: () => uuidv4().split('-')[0] // Use first segment of UUID
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

postSchema.pre('save', async function (next) {
  if (this.isModified('slug') || !this.slug) {

    let baseSlug = slugify(this.slug, {
      replacement: '-',
      lower: true,
      strict: true,
      trim: true
    });

    const slug = `${baseSlug}-${this.uniqueIdentifier}`;

    const existingPost = await this.constructor.findOne({ slug });

    if (existingPost && existingPost._id.toString() !== this._id.toString()) {
      this.slug = `${baseSlug}-${this.uniqueIdentifier}-${Date.now()}`;
    } else {
      this.slug = slug;
    }

    try {
      if (this.category) {
        const buildDisplayedWithin = async (categoryId) => {
          const result = {};
          let currentCat = await mongoose.model('Category').findById(categoryId);

          if (currentCat) {
            result.category = currentCat._id;
            if (currentCat.parentCategory) {
              const parentCat = await mongoose.model('Category').findById(currentCat.parentCategory);
              result.subcategory = currentCat._id;
              result.category = parentCat._id;

              if (parentCat.parentCategory) {
                const grandparentCat = await mongoose.model('Category').findById(parentCat.parentCategory);
                result.subsubcategory = currentCat._id;
                result.subcategory = parentCat._id;
                result.category = grandparentCat._id;
              }
            }
          }

          return result;
        };

        this.displayedWithin = [await buildDisplayedWithin(this.category)];
      }
    } catch (error) {
      console.error('Error generating displayedWithin:', error);
      return next(error);
    }

  }

  try {
    // Find the main parent category slug
    const findMainParentSlug = async (categoryId) => {
      let currentCat = await mongoose.model('Category').findById(categoryId);
      while (currentCat && currentCat.parentCategory) {
        currentCat = await mongoose.model('Category').findById(currentCat.parentCategory);
      }
      return currentCat ? currentCat.slug : null;
    };

    // Get the main parent category slug
    const mainParentSlug = this.category ? await findMainParentSlug(this.category) : null;

    // Construct the fullPathSlug
    this.fullPathSlug = mainParentSlug ? `${mainParentSlug}/${this.slug}` : this.slug;
  } catch (error) {
    console.error('Error generating full path slug:', error);
    return next(error);
  }

  next();
});

// Ensure no duplicate index definitions
// postSchema.index({ slug: 1 }, { unique: true });
postSchema.index({ category: 1, createdAt: -1 });

// Virtual to populate category path
postSchema.virtual('categoryPathPopulated', {
  ref: 'Category',
  localField: 'categoryPath',
  foreignField: '_id'
});

// Method to generate meta information automatically
postSchema.methods.generateMetaInfo = function () {
  if (!this.metaTitle) {
    this.metaTitle = this.title.substring(0, 60);
  }

  if (!this.metaDescription) {
    this.metaDescription = this.shortDescription
      ? this.shortDescription.substring(0, 160)
      : this.title.substring(0, 160);
  }
};

// Static method to find by full path slug
postSchema.statics.findByFullPathSlug = function (fullPathSlug) {
  return this.findOne({ fullPathSlug });
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;