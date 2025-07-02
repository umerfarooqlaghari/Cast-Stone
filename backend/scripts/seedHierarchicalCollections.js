const mongoose = require('mongoose');
const Collection = require('../models/Collection');
const Product = require('../models/Product');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Clear existing collections
const clearCollections = async () => {
  try {
    await Collection.deleteMany({});
    console.log('🗑️ Cleared existing collections');
  } catch (error) {
    console.error('Error clearing collections:', error);
  }
};

// Create hierarchical collection structure
const createHierarchicalCollections = async () => {
  try {
    console.log('🏗️ Creating hierarchical collection structure...');

    // 1. ARCHITECTURAL COLLECTION (Root Level)
    const architectural = new Collection({
      title: 'Architectural',
      description: 'Professional architectural cast stone elements for commercial and residential projects',
      handle: 'architectural',
      collectionType: 'manual',
      level: 0,
      path: 'architectural',
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Architectural Cast Stone Elements',
        description: 'Professional architectural cast stone elements for commercial and residential projects',
        slug: 'architectural'
      }
    });
    await architectural.save();
    console.log('✅ Created: Architectural (Root)');

    // Architectural Sub Collections
    const archColumns = new Collection({
      title: 'Columns',
      description: 'Classical and modern architectural columns',
      handle: 'columns',
      collectionType: 'manual',
      parent: architectural._id,
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Architectural Columns - Cast Stone',
        description: 'Classical and modern architectural columns in cast stone',
        slug: 'architectural-columns'
      }
    });
    await archColumns.save();
    architectural.children.push(archColumns._id);

    const archMoldings = new Collection({
      title: 'Moldings & Trim',
      description: 'Decorative moldings and architectural trim pieces',
      handle: 'moldings-trim',
      collectionType: 'manual',
      parent: architectural._id,
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Architectural Moldings & Trim - Cast Stone',
        description: 'Decorative moldings and architectural trim pieces in cast stone',
        slug: 'architectural-moldings-trim'
      }
    });
    await archMoldings.save();
    architectural.children.push(archMoldings._id);

    const archBalustrades = new Collection({
      title: 'Balustrades',
      description: 'Elegant balustrades and railings for stairs and terraces',
      handle: 'balustrades',
      collectionType: 'manual',
      parent: architectural._id,
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Architectural Balustrades - Cast Stone',
        description: 'Elegant balustrades and railings for stairs and terraces',
        slug: 'architectural-balustrades'
      }
    });
    await archBalustrades.save();
    architectural.children.push(archBalustrades._id);

    await architectural.save();

    // Architectural Sub Sub Collections (Columns)
    const doricColumns = new Collection({
      title: 'Doric Columns',
      description: 'Classical Doric style columns with simple, elegant design',
      handle: 'doric-columns',
      collectionType: 'manual',
      parent: archColumns._id,
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Doric Columns - Classical Cast Stone',
        description: 'Classical Doric style columns with simple, elegant design',
        slug: 'doric-columns'
      }
    });
    await doricColumns.save();
    archColumns.children.push(doricColumns._id);

    const ionicColumns = new Collection({
      title: 'Ionic Columns',
      description: 'Ornate Ionic columns with distinctive scroll capitals',
      handle: 'ionic-columns',
      collectionType: 'manual',
      parent: archColumns._id,
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Ionic Columns - Classical Cast Stone',
        description: 'Ornate Ionic columns with distinctive scroll capitals',
        slug: 'ionic-columns'
      }
    });
    await ionicColumns.save();
    archColumns.children.push(ionicColumns._id);

    const corinthianColumns = new Collection({
      title: 'Corinthian Columns',
      description: 'Elaborate Corinthian columns with acanthus leaf capitals',
      handle: 'corinthian-columns',
      collectionType: 'manual',
      parent: archColumns._id,
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Corinthian Columns - Classical Cast Stone',
        description: 'Elaborate Corinthian columns with acanthus leaf capitals',
        slug: 'corinthian-columns'
      }
    });
    await corinthianColumns.save();
    archColumns.children.push(corinthianColumns._id);

    await archColumns.save();

    // 2. DESIGNER COLLECTION (Root Level)
    const designer = new Collection({
      title: 'Designer',
      description: 'Curated designer cast stone pieces for luxury interiors and exteriors',
      handle: 'designer',
      collectionType: 'manual',
      level: 0,
      path: 'designer',
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Designer Cast Stone Collection',
        description: 'Curated designer cast stone pieces for luxury interiors and exteriors',
        slug: 'designer'
      }
    });
    await designer.save();
    console.log('✅ Created: Designer (Root)');

    // Designer Sub Collections
    const fireplaces = new Collection({
      title: 'Fireplaces',
      description: 'Luxury fireplace mantels and surrounds',
      handle: 'fireplaces',
      collectionType: 'manual',
      parent: designer._id,
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Designer Fireplaces - Cast Stone',
        description: 'Luxury fireplace mantels and surrounds in cast stone',
        slug: 'designer-fireplaces'
      }
    });
    await fireplaces.save();
    designer.children.push(fireplaces._id);

    const fountains = new Collection({
      title: 'Fountains',
      description: 'Elegant water fountains for gardens and courtyards',
      handle: 'fountains',
      collectionType: 'manual',
      parent: designer._id,
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Designer Fountains - Cast Stone',
        description: 'Elegant water fountains for gardens and courtyards',
        slug: 'designer-fountains'
      }
    });
    await fountains.save();
    designer.children.push(fountains._id);

    const planters = new Collection({
      title: 'Planters',
      description: 'Decorative planters and garden vessels',
      handle: 'planters',
      collectionType: 'manual',
      parent: designer._id,
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Designer Planters - Cast Stone',
        description: 'Decorative planters and garden vessels in cast stone',
        slug: 'designer-planters'
      }
    });
    await planters.save();
    designer.children.push(planters._id);

    await designer.save();

    // Designer Sub Sub Collections (Fireplaces)
    const traditionalFireplaces = new Collection({
      title: 'Traditional Mantels',
      description: 'Classic traditional fireplace mantels with ornate detailing',
      handle: 'traditional-mantels',
      collectionType: 'manual',
      parent: fireplaces._id,
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Traditional Fireplace Mantels - Cast Stone',
        description: 'Classic traditional fireplace mantels with ornate detailing',
        slug: 'traditional-mantels'
      }
    });
    await traditionalFireplaces.save();
    fireplaces.children.push(traditionalFireplaces._id);

    const modernFireplaces = new Collection({
      title: 'Modern Surrounds',
      description: 'Contemporary fireplace surrounds with clean lines',
      handle: 'modern-surrounds',
      collectionType: 'manual',
      parent: fireplaces._id,
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Modern Fireplace Surrounds - Cast Stone',
        description: 'Contemporary fireplace surrounds with clean lines',
        slug: 'modern-surrounds'
      }
    });
    await modernFireplaces.save();
    fireplaces.children.push(modernFireplaces._id);

    await fireplaces.save();

    console.log('✅ Created Designer collection hierarchy');

    // 3. LIMITED EDITION COLLECTION (Root Level)
    const limitedEdition = new Collection({
      title: 'Limited Edition',
      description: 'Exclusive limited edition cast stone pieces by renowned artists',
      handle: 'limited-edition',
      collectionType: 'manual',
      level: 0,
      path: 'limited-edition',
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Limited Edition Cast Stone Collection',
        description: 'Exclusive limited edition cast stone pieces by renowned artists',
        slug: 'limited-edition'
      }
    });
    await limitedEdition.save();
    console.log('✅ Created: Limited Edition (Root)');

    // Limited Edition Sub Collections
    const sculptures = new Collection({
      title: 'Sculptures',
      description: 'Artistic sculptures and decorative pieces',
      handle: 'sculptures',
      collectionType: 'manual',
      parent: limitedEdition._id,
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Limited Edition Sculptures - Cast Stone',
        description: 'Artistic sculptures and decorative pieces in cast stone',
        slug: 'limited-edition-sculptures'
      }
    });
    await sculptures.save();
    limitedEdition.children.push(sculptures._id);

    const artistSeries = new Collection({
      title: 'Artist Series',
      description: 'Exclusive pieces by featured artists',
      handle: 'artist-series',
      collectionType: 'manual',
      parent: limitedEdition._id,
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Artist Series - Limited Edition Cast Stone',
        description: 'Exclusive pieces by featured artists in cast stone',
        slug: 'artist-series'
      }
    });
    await artistSeries.save();
    limitedEdition.children.push(artistSeries._id);

    await limitedEdition.save();

    // 4. CAST STONE SEALERS COLLECTION (Root Level)
    const sealers = new Collection({
      title: 'Cast Stone Sealers',
      description: 'Professional sealers and maintenance products for cast stone',
      handle: 'cast-stone-sealers',
      collectionType: 'manual',
      level: 0,
      path: 'cast-stone-sealers',
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Cast Stone Sealers & Maintenance',
        description: 'Professional sealers and maintenance products for cast stone',
        slug: 'cast-stone-sealers'
      }
    });
    await sealers.save();
    console.log('✅ Created: Cast Stone Sealers (Root)');

    // Sealers Sub Collections
    const penetratingSealers = new Collection({
      title: 'Penetrating Sealers',
      description: 'Deep penetrating sealers for long-lasting protection',
      handle: 'penetrating-sealers',
      collectionType: 'manual',
      parent: sealers._id,
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Penetrating Sealers - Cast Stone Protection',
        description: 'Deep penetrating sealers for long-lasting cast stone protection',
        slug: 'penetrating-sealers'
      }
    });
    await penetratingSealers.save();
    sealers.children.push(penetratingSealers._id);

    const surfaceSealers = new Collection({
      title: 'Surface Sealers',
      description: 'Surface coating sealers for enhanced appearance',
      handle: 'surface-sealers',
      collectionType: 'manual',
      parent: sealers._id,
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Surface Sealers - Cast Stone Enhancement',
        description: 'Surface coating sealers for enhanced cast stone appearance',
        slug: 'surface-sealers'
      }
    });
    await surfaceSealers.save();
    sealers.children.push(surfaceSealers._id);

    const cleaningProducts = new Collection({
      title: 'Cleaning Products',
      description: 'Specialized cleaning products for cast stone maintenance',
      handle: 'cleaning-products',
      collectionType: 'manual',
      parent: sealers._id,
      published: true,
      publishedAt: new Date(),
      seo: {
        title: 'Cast Stone Cleaning Products',
        description: 'Specialized cleaning products for cast stone maintenance',
        slug: 'cleaning-products'
      }
    });
    await cleaningProducts.save();
    sealers.children.push(cleaningProducts._id);

    await sealers.save();

    console.log('✅ Created Cast Stone Sealers collection hierarchy');
    console.log('🎉 Hierarchical collection structure created successfully!');

    return {
      architectural,
      designer,
      limitedEdition,
      sealers,
      subCollections: {
        archColumns,
        archMoldings,
        archBalustrades,
        fireplaces,
        fountains,
        planters,
        sculptures,
        artistSeries,
        penetratingSealers,
        surfaceSealers,
        cleaningProducts
      },
      subSubCollections: {
        doricColumns,
        ionicColumns,
        corinthianColumns,
        traditionalFireplaces,
        modernFireplaces
      }
    };

  } catch (error) {
    console.error('❌ Error creating hierarchical collections:', error);
    throw error;
  }
};

// Main execution function
const main = async () => {
  try {
    await connectDB();
    await clearCollections();
    const collections = await createHierarchicalCollections();
    
    console.log('\n📊 Collection Summary:');
    console.log(`- Root Collections: 4`);
    console.log(`- Sub Collections: ${Object.keys(collections.subCollections).length}`);
    console.log(`- Sub Sub Collections: ${Object.keys(collections.subSubCollections).length}`);
    console.log('\n✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createHierarchicalCollections };
