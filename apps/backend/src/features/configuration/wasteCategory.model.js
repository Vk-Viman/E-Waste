const mongoose = require('mongoose');

/**
 * Centralized WasteCategory model for managing categories
 * Supports validation, adding, updating, and removing categories
 */
const WasteCategorySchema = new mongoose.Schema(
  {
    key: { 
      type: String, 
      trim: true, 
      required: true, 
      unique: true,
      lowercase: true 
    },
    label: { 
      type: String, 
      trim: true, 
      required: true 
    },
    description: { 
      type: String, 
      trim: true, 
      default: '' 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
  },
  { timestamps: true }
);

// Validate that key follows proper naming convention
WasteCategorySchema.pre('save', function(next) {
  if (this.key && !/^[a-z0-9-]+$/.test(this.key)) {
    return next(new Error('Category key must contain only lowercase letters, numbers, and hyphens'));
  }
  next();
});

module.exports = mongoose.model('WasteCategory', WasteCategorySchema);
