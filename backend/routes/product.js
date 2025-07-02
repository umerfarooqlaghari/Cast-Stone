const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController.js');

// Multer setup for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });
console.log("✅ product.js loaded");

// Routes
router.get('/', getAllProducts);
// Replace upload.single with upload.array
router.post('/', upload.array('images'), createProduct);

router.put('/:id', upload.single('image'), updateProduct);
router.post('/delete-multiple', deleteProduct);


module.exports = router;
