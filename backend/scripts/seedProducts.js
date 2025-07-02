const mongoose = require('mongoose');
const Product = require('../models/Product');
const Collection = require('../models/Collection');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedProducts = async () => {
  try {
    console.log('🌱 Starting product seeding...');

    // Get collections for reference
    const collections = await Collection.find({});
    const architecturalCollection = collections.find(c => c.handle === 'architectural');
    const designerCollection = collections.find(c => c.handle === 'designer');
    const limitedEditionCollection = collections.find(c => c.handle === 'limited-edition');
    const sealersCollection = collections.find(c => c.handle === 'cast-stone-sealers');

    // Sample products data
    const products = [
      // Architectural Products
      {
        title: 'Classic Doric Column',
        handle: 'classic-doric-column',
        description: 'Handcrafted Doric column featuring traditional Greek architectural styling. Perfect for grand entrances and classical facades.',
        category: 'architectural',
        productType: 'physical',
        priceRange: { min: 1200, max: 2500 },
        totalInventory: 15,
        status: 'active',
        publishedAt: new Date(),
        collections: architecturalCollection ? [architecturalCollection._id] : [],
        images: [
          { url: '/images/products/doric-column.jpg', altText: 'Classic Doric Column' }
        ],
        featuredImage: { url: '/images/products/doric-column.jpg', altText: 'Classic Doric Column' },
        tags: ['column', 'architectural', 'classical', 'greek'],
        seo: {
          title: 'Classic Doric Column - Cast Stone Architectural Elements',
          description: 'Premium handcrafted Doric columns for classical architecture projects.',
          keywords: ['doric column', 'cast stone', 'architectural', 'classical'],
          slug: 'classic-doric-column'
        }
      },
      {
        title: 'Ornate Corinthian Capital',
        handle: 'ornate-corinthian-capital',
        description: 'Intricately detailed Corinthian capital with acanthus leaf motifs. Ideal for luxury residential and commercial projects.',
        category: 'architectural',
        priceRange: { min: 800, max: 1500 },
        totalInventory: 20,
        status: 'active',
        publishedAt: new Date(),
        collections: architecturalCollection ? [architecturalCollection._id] : [],
        images: [
          { url: '/images/products/corinthian-capital.jpg', altText: 'Ornate Corinthian Capital' }
        ],
        featuredImage: { url: '/images/products/corinthian-capital.jpg', altText: 'Ornate Corinthian Capital' },
        tags: ['capital', 'corinthian', 'architectural', 'ornate'],
        seo: {
          title: 'Ornate Corinthian Capital - Cast Stone Architectural Details',
          description: 'Handcrafted Corinthian capitals with intricate acanthus leaf details.',
          keywords: ['corinthian capital', 'cast stone', 'architectural details', 'acanthus'],
          slug: 'ornate-corinthian-capital'
        }
      },
      {
        title: 'Georgian Balustrade System',
        description: 'Complete balustrade system in Georgian style. Includes balusters, handrail, and newel posts.',
        category: 'architectural',
        priceRange: { min: 2500, max: 5000 },
        totalInventory: 8,
        status: 'active',
        publishedAt: new Date(),
        collections: architecturalCollection ? [architecturalCollection._id] : [],
        images: [
          { url: '/images/products/georgian-balustrade.jpg', altText: 'Georgian Balustrade System' }
        ],
        featuredImage: { url: '/images/products/georgian-balustrade.jpg', altText: 'Georgian Balustrade System' },
        tags: ['balustrade', 'georgian', 'handrail', 'architectural'],
        seo: {
          title: 'Georgian Balustrade System - Cast Stone Railings',
          description: 'Complete Georgian style balustrade systems for staircases and terraces.',
          keywords: ['georgian balustrade', 'cast stone railings', 'handrail', 'balusters']
        }
      },

      // Designer Products
      {
        title: 'Victorian Fireplace Surround',
        description: 'Elegant Victorian-style fireplace surround with intricate carved details. Creates a stunning focal point for any room.',
        category: 'fireplaces',
        priceRange: { min: 3500, max: 6500 },
        totalInventory: 5,
        status: 'active',
        publishedAt: new Date(),
        collections: designerCollection ? [designerCollection._id] : [],
        images: [
          { url: '/images/products/victorian-fireplace.jpg', altText: 'Victorian Fireplace Surround' }
        ],
        featuredImage: { url: '/images/products/victorian-fireplace.jpg', altText: 'Victorian Fireplace Surround' },
        tags: ['fireplace', 'victorian', 'surround', 'carved'],
        seo: {
          title: 'Victorian Fireplace Surround - Cast Stone Mantels',
          description: 'Handcrafted Victorian fireplace surrounds with intricate carved details.',
          keywords: ['victorian fireplace', 'cast stone mantel', 'fireplace surround', 'carved details']
        }
      },
      {
        title: 'Modern Minimalist Mantel',
        description: 'Clean, contemporary fireplace mantel with sleek lines. Perfect for modern and minimalist interiors.',
        category: 'fireplaces',
        priceRange: { min: 1800, max: 3200 },
        totalInventory: 12,
        status: 'active',
        publishedAt: new Date(),
        collections: designerCollection ? [designerCollection._id] : [],
        images: [
          { url: '/images/products/modern-mantel.jpg', altText: 'Modern Minimalist Mantel' }
        ],
        featuredImage: { url: '/images/products/modern-mantel.jpg', altText: 'Modern Minimalist Mantel' },
        tags: ['fireplace', 'modern', 'minimalist', 'contemporary'],
        seo: {
          title: 'Modern Minimalist Mantel - Contemporary Cast Stone',
          description: 'Sleek modern fireplace mantels for contemporary interior design.',
          keywords: ['modern mantel', 'minimalist fireplace', 'contemporary cast stone', 'sleek design']
        }
      },
      {
        title: 'Tiered Garden Fountain',
        description: 'Three-tiered garden fountain with classical styling. Creates a beautiful centerpiece for any outdoor space.',
        category: 'garden',
        priceRange: { min: 4500, max: 8500 },
        totalInventory: 3,
        status: 'active',
        publishedAt: new Date(),
        collections: designerCollection ? [designerCollection._id] : [],
        images: [
          { url: '/images/products/tiered-fountain.jpg', altText: 'Tiered Garden Fountain' }
        ],
        featuredImage: { url: '/images/products/tiered-fountain.jpg', altText: 'Tiered Garden Fountain' },
        tags: ['fountain', 'garden', 'tiered', 'water feature'],
        seo: {
          title: 'Tiered Garden Fountain - Cast Stone Water Features',
          description: 'Elegant three-tiered garden fountains for outdoor landscaping.',
          keywords: ['garden fountain', 'tiered fountain', 'cast stone water feature', 'outdoor fountain']
        }
      },

      // Limited Edition Products
      {
        title: 'Renaissance Angel Sculpture',
        description: 'Limited edition Renaissance-inspired angel sculpture. Hand-carved by master artisans with exceptional detail.',
        category: 'decorative',
        priceRange: { min: 8500, max: 12000 },
        totalInventory: 2,
        status: 'active',
        publishedAt: new Date(),
        collections: limitedEditionCollection ? [limitedEditionCollection._id] : [],
        images: [
          { url: '/images/products/renaissance-angel.jpg', altText: 'Renaissance Angel Sculpture' }
        ],
        featuredImage: { url: '/images/products/renaissance-angel.jpg', altText: 'Renaissance Angel Sculpture' },
        tags: ['sculpture', 'angel', 'renaissance', 'limited edition'],
        seo: {
          title: 'Renaissance Angel Sculpture - Limited Edition Cast Stone Art',
          description: 'Exclusive Renaissance-inspired angel sculptures by master artisans.',
          keywords: ['renaissance angel', 'cast stone sculpture', 'limited edition art', 'angel statue']
        }
      },
      {
        title: 'Art Deco Planter Collection',
        description: 'Exclusive Art Deco-inspired planter set. Features geometric patterns and luxurious finishes.',
        category: 'garden',
        priceRange: { min: 2200, max: 4500 },
        totalInventory: 6,
        status: 'active',
        publishedAt: new Date(),
        collections: limitedEditionCollection ? [limitedEditionCollection._id] : [],
        images: [
          { url: '/images/products/art-deco-planters.jpg', altText: 'Art Deco Planter Collection' }
        ],
        featuredImage: { url: '/images/products/art-deco-planters.jpg', altText: 'Art Deco Planter Collection' },
        tags: ['planter', 'art deco', 'geometric', 'limited edition'],
        seo: {
          title: 'Art Deco Planter Collection - Limited Edition Garden Planters',
          description: 'Exclusive Art Deco-inspired planters with geometric patterns.',
          keywords: ['art deco planters', 'geometric planters', 'limited edition garden', 'luxury planters']
        }
      },

      // Cast Stone Sealers
      {
        title: 'Premium Penetrating Sealer',
        description: 'High-performance penetrating sealer for cast stone protection. Provides long-lasting water and stain resistance.',
        category: 'sealers',
        priceRange: { min: 45, max: 85 },
        totalInventory: 50,
        status: 'active',
        publishedAt: new Date(),
        collections: sealersCollection ? [sealersCollection._id] : [],
        images: [
          { url: '/images/products/penetrating-sealer.jpg', altText: 'Premium Penetrating Sealer' }
        ],
        featuredImage: { url: '/images/products/penetrating-sealer.jpg', altText: 'Premium Penetrating Sealer' },
        tags: ['sealer', 'penetrating', 'protection', 'maintenance'],
        seo: {
          title: 'Premium Penetrating Sealer - Cast Stone Protection',
          description: 'Professional-grade penetrating sealers for cast stone maintenance.',
          keywords: ['penetrating sealer', 'cast stone sealer', 'stone protection', 'waterproof sealer']
        }
      },
      {
        title: 'Stone Cleaning Solution',
        description: 'Specialized cleaning solution for cast stone surfaces. Removes stains and restores natural beauty.',
        category: 'sealers',
        priceRange: { min: 25, max: 45 },
        totalInventory: 75,
        status: 'active',
        publishedAt: new Date(),
        collections: sealersCollection ? [sealersCollection._id] : [],
        images: [
          { url: '/images/products/stone-cleaner.jpg', altText: 'Stone Cleaning Solution' }
        ],
        featuredImage: { url: '/images/products/stone-cleaner.jpg', altText: 'Stone Cleaning Solution' },
        tags: ['cleaner', 'cleaning', 'maintenance', 'restoration'],
        seo: {
          title: 'Stone Cleaning Solution - Cast Stone Maintenance',
          description: 'Professional stone cleaning solutions for cast stone care.',
          keywords: ['stone cleaner', 'cast stone cleaning', 'stone maintenance', 'stain remover']
        }
      }
    ];

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');

    // Helper function to generate handle from title
    const generateHandle = (title) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    // Add productType and handle to all products
    const productsWithType = products.map(product => ({
      ...product,
      productType: 'physical',
      handle: product.handle || generateHandle(product.title),
      seo: {
        ...product.seo,
        slug: product.seo?.slug || generateHandle(product.title)
      }
    }));

    // Insert new products
    const createdProducts = await Product.insertMany(productsWithType);
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log('🎉 Product seeding completed successfully!');
    
    // Display summary
    console.log('\n📊 Products Summary:');
    console.log(`- Architectural: ${createdProducts.filter(p => p.category === 'architectural').length}`);
    console.log(`- Fireplaces: ${createdProducts.filter(p => p.category === 'fireplaces').length}`);
    console.log(`- Garden: ${createdProducts.filter(p => p.category === 'garden').length}`);
    console.log(`- Decorative: ${createdProducts.filter(p => p.category === 'decorative').length}`);
    console.log(`- Sealers: ${createdProducts.filter(p => p.category === 'sealers').length}`);

  } catch (error) {
    console.error('❌ Error seeding products:', error);
  }
};

const main = async () => {
  await connectDB();
  await seedProducts();
  await mongoose.connection.close();
  console.log('👋 Database connection closed');
};

main().catch(console.error);
