const fs = require('fs');
const path = require('path');
const Product = require('../models/Product.js');

// Get all products or filter by category or tags
exports.getAllProducts = async (req, res) => {
  try {
    const { category, tags } = req.query;
    let filter = {};

    // Apply category filter (case-insensitive)
    if (category && category !== 'all') {
      filter.category = { $regex: new RegExp(category, 'i') };
    }

    // Apply tags filter (array match, case-insensitive)
    if (tags && tags !== 'all') {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // Fetch products based on dynamic filter
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// Bulk Add Products (admin)
exports.addProduct = async (req, res) => {
  try {
    const products = JSON.parse(req.body.products); // JSON string in body
    const files = req.files || [];

    const savedProducts = await Promise.all(products.map((product, index) => {
      const file = files[index];
      const imageUrl = file ? `/uploads/${file.filename}` : null;
      const imagePath = file ? file.path : null;

      const newProduct = new Product({
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.price,
        tags: product.tags || [],
        imageUrl,
        imagePath
      });

      return newProduct.save();
    }));

    res.status(201).json(savedProducts);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error adding products', error: err.message });
  }
};

// Update product by ID (admin)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = req.body;

    if (req.file) {
      const existingProduct = await Product.findById(id);
      if (existingProduct.imagePath && fs.existsSync(existingProduct.imagePath)) {
        fs.unlinkSync(existingProduct.imagePath);
      }

      updatedFields.imageUrl = `/uploads/${req.file.filename}`;
      updatedFields.imagePath = req.file.path;
    }

    if (updatedFields.tags && typeof updatedFields.tags === 'string') {
      updatedFields.tags = updatedFields.tags.split(','); // convert to array if sent as string
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedFields, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: 'Error updating product', error: err.message });
  }
};

// Bulk Delete Products by ID list (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No product IDs provided' });
    }

    const deletedProducts = [];

    for (const id of ids) {
      const product = await Product.findById(id);
      if (product) {
        if (product.imagePath && fs.existsSync(product.imagePath)) {
          fs.unlinkSync(product.imagePath);
        }
        await Product.findByIdAndDelete(id);
        deletedProducts.push(id);
      }
    }

    res.json({ message: 'Products deleted successfully', deletedProducts });
  } catch (err) {
    res.status(400).json({ message: 'Error deleting products', error: err.message });
  }
};
