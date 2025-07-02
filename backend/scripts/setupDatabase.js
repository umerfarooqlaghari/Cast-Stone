const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const Collection = require('../models/Collection');
require('dotenv').config();

const setupDatabase = async () => {
  try {
    console.log('🚀 Cast Stone Database Setup');
    console.log('============================\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in environment variables');
      process.exit(1);
    }

    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Admin.deleteMany({});
    await Product.deleteMany({});
    await Collection.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create Super Admin
    console.log('👑 Creating Super Admin...');
    const superAdminData = {
      name: 'Mumer Farooq Laghari',
      email: 'mumerfarooqlaghari@gmail.com',
      password: '132Trent@!',
      role: 'super_admin',
      permissions: {
        products: ['read', 'create', 'update', 'delete'],
        orders: ['read', 'create', 'update', 'delete'],
        users: ['read', 'create', 'update', 'delete'],
        analytics: ['read', 'create', 'update', 'delete'],
        admins: ['read', 'create', 'update', 'delete']
      },
      isActive: true,
      mustChangePassword: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(superAdminData.password, saltRounds);

    const superAdmin = new Admin({
      ...superAdminData,
      password: hashedPassword
    });
    
    await superAdmin.save();
    console.log('✅ Super Admin created successfully!');
    console.log(`📧 Email: ${superAdminData.email}`);
    console.log(`🔑 Password: ${superAdminData.password}\n`);

    // Create Sample Products
    console.log('📦 Creating sample products...');
    
    const sampleProducts = [
      {
        title: 'Classic Stone Pillar',
        description: 'Elegant cast stone pillar perfect for architectural enhancement. Handcrafted with premium materials for lasting beauty.',
        vendor: 'Cast Stone Creations',
        productType: 'Architectural',
        category: 'Pillars',
        tags: ['architectural', 'classic', 'pillar', 'stone'],
        status: 'active',
        publishedAt: new Date(),
        handle: 'classic-stone-pillar',
        seo: {
          title: 'Classic Stone Pillar - Premium Cast Stone',
          description: 'Premium cast stone pillar for architectural enhancement',
          slug: 'classic-stone-pillar'
        },
        variants: [{
          title: 'Standard Size',
          price: 299.99,
          compareAtPrice: 349.99,
          sku: 'CSP-001-STD',
          inventoryQuantity: 25,
          weight: 45.5,
          dimensions: {
            length: 12,
            width: 12,
            height: 48
          }
        }],
        images: [{
          url: '/uploads/pillar-classic.jpg',
          altText: 'Classic Stone Pillar'
        }],
        options: [
          {
            name: 'Size',
            values: ['Standard', 'Large', 'Extra Large']
          },
          {
            name: 'Finish',
            values: ['Natural', 'Polished', 'Textured']
          }
        ]
      },
      {
        title: 'Decorative Garden Fountain',
        description: 'Beautiful cast stone fountain featuring intricate designs. Perfect centerpiece for gardens and courtyards.',
        vendor: 'Cast Stone Creations',
        productType: 'Garden',
        category: 'Fountains',
        tags: ['garden', 'fountain', 'decorative', 'water feature'],
        status: 'active',
        publishedAt: new Date(),
        handle: 'decorative-garden-fountain',
        seo: {
          title: 'Decorative Garden Fountain - Cast Stone Water Feature',
          description: 'Beautiful cast stone fountain for gardens and courtyards',
          slug: 'decorative-garden-fountain'
        },
        variants: [{
          title: 'Medium Fountain',
          price: 899.99,
          compareAtPrice: 1099.99,
          sku: 'DGF-001-MED',
          inventoryQuantity: 8,
          weight: 125.0,
          dimensions: {
            length: 36,
            width: 36,
            height: 42
          }
        }],
        images: [{
          url: '/uploads/fountain-decorative.jpg',
          altText: 'Decorative Garden Fountain'
        }],
        options: [
          {
            name: 'Style',
            values: ['Classical', 'Modern', 'Traditional']
          },
          {
            name: 'Color',
            values: ['Natural Stone', 'Weathered Gray', 'Antique White']
          }
        ]
      },
      {
        title: 'Ornate Window Surround',
        description: 'Sophisticated cast stone window surround with detailed molding. Adds elegance to any architectural project.',
        vendor: 'Cast Stone Creations',
        productType: 'Architectural',
        category: 'Window Surrounds',
        tags: ['window', 'surround', 'ornate', 'molding'],
        status: 'active',
        publishedAt: new Date(),
        handle: 'ornate-window-surround',
        seo: {
          title: 'Ornate Window Surround - Cast Stone Molding',
          description: 'Sophisticated cast stone window surround with detailed molding',
          slug: 'ornate-window-surround'
        },
        variants: [{
          title: 'Standard Window',
          price: 459.99,
          compareAtPrice: 529.99,
          sku: 'OWS-001-STD',
          inventoryQuantity: 15,
          weight: 65.0,
          dimensions: {
            length: 48,
            width: 6,
            height: 60
          }
        }],
        images: [{
          url: '/uploads/window-surround.jpg',
          altText: 'Ornate Window Surround'
        }],
        options: [
          {
            name: 'Window Size',
            values: ['Standard', 'Large', 'Custom']
          },
          {
            name: 'Detail Level',
            values: ['Simple', 'Ornate', 'Elaborate']
          }
        ]
      },
      {
        title: 'Cast Stone Balustrade Set',
        description: 'Complete balustrade set including balusters and rail. Perfect for staircases, terraces, and balconies.',
        vendor: 'Cast Stone Creations',
        productType: 'Architectural',
        category: 'Balustrades',
        tags: ['balustrade', 'staircase', 'railing', 'architectural'],
        status: 'active',
        publishedAt: new Date(),
        handle: 'cast-stone-balustrade-set',
        seo: {
          title: 'Cast Stone Balustrade Set - Complete Railing System',
          description: 'Complete cast stone balustrade set for staircases and terraces',
          slug: 'cast-stone-balustrade-set'
        },
        variants: [{
          title: '6-Foot Section',
          price: 649.99,
          compareAtPrice: 749.99,
          sku: 'CSB-001-6FT',
          inventoryQuantity: 12,
          weight: 85.0,
          dimensions: {
            length: 72,
            width: 8,
            height: 36
          }
        }],
        images: [{
          url: '/uploads/balustrade-set.jpg',
          altText: 'Cast Stone Balustrade Set'
        }],
        options: [
          {
            name: 'Length',
            values: ['4 Feet', '6 Feet', '8 Feet', 'Custom']
          },
          {
            name: 'Style',
            values: ['Classical', 'Contemporary', 'Traditional']
          }
        ]
      },
      {
        title: 'Designer Stone Planter',
        description: 'Elegant cast stone planter with sophisticated design. Ideal for both indoor and outdoor plant displays.',
        vendor: 'Cast Stone Creations',
        productType: 'Garden',
        category: 'Planters',
        tags: ['planter', 'garden', 'designer', 'stone'],
        status: 'active',
        publishedAt: new Date(),
        handle: 'designer-stone-planter',
        seo: {
          title: 'Designer Stone Planter - Cast Stone Garden Decor',
          description: 'Elegant cast stone planter for indoor and outdoor use',
          slug: 'designer-stone-planter'
        },
        variants: [{
          title: 'Large Planter',
          price: 189.99,
          compareAtPrice: 229.99,
          sku: 'DSP-001-LRG',
          inventoryQuantity: 20,
          weight: 28.0,
          dimensions: {
            length: 24,
            width: 24,
            height: 18
          }
        }],
        images: [{
          url: '/uploads/planter-designer.jpg',
          altText: 'Designer Stone Planter'
        }],
        options: [
          {
            name: 'Size',
            values: ['Small', 'Medium', 'Large', 'Extra Large']
          },
          {
            name: 'Drainage',
            values: ['With Drainage', 'Without Drainage']
          }
        ]
      }
    ];

    const createdProducts = [];
    for (const productData of sampleProducts) {
      const product = new Product(productData);
      await product.save();
      createdProducts.push(product);
      console.log(`✅ Created product: ${product.title}`);
    }

    console.log(`\n📦 Created ${createdProducts.length} sample products\n`);

    // Create Sample Collections
    console.log('📁 Creating sample collections...');
    
    const sampleCollections = [
      {
        title: 'Architectural Elements',
        description: 'Premium cast stone architectural elements for building enhancement',
        handle: 'architectural-elements',
        collectionType: 'manual',
        status: 'active',
        publishedAt: new Date(),
        seo: {
          title: 'Architectural Elements - Cast Stone Collection',
          description: 'Premium cast stone architectural elements collection',
          slug: 'architectural-elements'
        },
        products: createdProducts.filter(p => p.category === 'Pillars' || p.category === 'Window Surrounds' || p.category === 'Balustrades').map(p => p._id)
      },
      {
        title: 'Garden & Outdoor',
        description: 'Beautiful cast stone pieces for gardens and outdoor spaces',
        handle: 'garden-outdoor',
        collectionType: 'manual',
        status: 'active',
        publishedAt: new Date(),
        seo: {
          title: 'Garden & Outdoor - Cast Stone Collection',
          description: 'Beautiful cast stone pieces for gardens and outdoor spaces',
          slug: 'garden-outdoor'
        },
        products: createdProducts.filter(p => p.category === 'Fountains' || p.category === 'Planters').map(p => p._id)
      },
      {
        title: 'Featured Products',
        description: 'Our most popular and featured cast stone products',
        handle: 'featured-products',
        collectionType: 'manual',
        status: 'active',
        publishedAt: new Date(),
        seo: {
          title: 'Featured Products - Cast Stone Collection',
          description: 'Our most popular and featured cast stone products',
          slug: 'featured-products'
        },
        products: createdProducts.slice(0, 3).map(p => p._id)
      }
    ];

    for (const collectionData of sampleCollections) {
      const collection = new Collection(collectionData);
      await collection.save();
      console.log(`✅ Created collection: ${collection.title}`);
    }

    console.log(`\n📁 Created ${sampleCollections.length} sample collections\n`);

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`👑 Super Admin: ${superAdminData.email}`);
    console.log(`📦 Products: ${createdProducts.length} created`);
    console.log(`📁 Collections: ${sampleCollections.length} created`);
    console.log('\n🚀 You can now start the servers and access the admin dashboard!');
    console.log('🌐 Admin URL: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the setup
setupDatabase();
