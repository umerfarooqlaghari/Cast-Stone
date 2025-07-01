const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  description: String,
  price: Number,
  tags: [String],
  imageUrl: { type: String, default: null },
  imagePath: { type: String, default: null }
});

module.exports = mongoose.model('Product', productSchema);
