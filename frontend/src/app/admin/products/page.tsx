/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Upload,
  Download,
  MoreHorizontal,
  FolderTree
} from 'lucide-react';
import { useAdmin } from '../../../contexts/AdminContext';
import CollectionHierarchy from '../../../components/admin/CollectionHierarchy';
import CollectionModal from '../../../components/admin/CollectionModal';
import { collectionsApi, productsApi } from '../../../services/api';
import styles from './page.module.css';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'draft';
  imageUrl?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsManagement() {
  const { hasPermission, addNotification } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    category: '',
    priceRange: { min: 0, max: 0 },
    totalInventory: 0,
    status: 'draft',
    collections: [] as string[],
    images: [] as string[]
  });

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      if (data.success) {
        // Transform API data to match our interface
        const transformedProducts = data.data.products.map((product: {
          _id: string;
          title: string;
          category: string;
          priceRange?: { min?: number };
          totalInventory?: number;
          status: string;
          featuredImage?: { url?: string };
          images?: { url?: string }[];
          description?: string;
          createdAt: string;
          updatedAt: string;
          collections?: { _id: string; title: string; handle: string }[];
        }) => ({
          id: product._id,
          name: product.title,
          category: product.category,
          price: product.priceRange?.min || 0,
          stock: product.totalInventory || 0,
          status: product.status,
          imageUrl: product.featuredImage?.url || product.images?.[0]?.url || '/images/placeholder.jpg',
          description: product.description || '',
          createdAt: new Date(product.createdAt).toLocaleDateString(),
          updatedAt: new Date(product.updatedAt).toLocaleDateString(),
          collections: product.collections || []
        }));
        setProducts(transformedProducts);
      } else {
        throw new Error(data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load products'
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  // Fetch collections for the dropdown
  const fetchCollections = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/collections?hierarchy=true');
      if (response.ok) {
        const data = await response.json();
        console.log('Collections API response:', data);
        // The API returns collections in data.data.collections
        setCollections(data.data?.collections || []);
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      setCollections([]); // Ensure collections is always an array
    }
  };

  // Handle product creation
  const handleCreateProduct = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
      });

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Product created successfully'
        });
        setShowAddProductModal(false);
        setNewProduct({
          title: '',
          description: '',
          category: '',
          priceRange: { min: 0, max: 0 },
          totalInventory: 0,
          status: 'draft',
          collections: [],
          images: []
        });
        fetchProducts(); // Refresh the products list
      } else {
        throw new Error('Failed to create product');
      }
    } catch (error) {
      console.error('Failed to create product:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create product'
      });
    }
  };

  // Fetch products and collections on component mount
  useEffect(() => {
    fetchProducts();
    fetchCollections();
  }, [fetchProducts]);

  const categories = ['all', 'fireplaces', 'garden', 'architectural', 'decorative'];
  const statuses = ['all', 'active', 'inactive', 'draft'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!hasPermission('products', 'delete')) {
      addNotification({
        type: 'error',
        title: 'Permission Denied',
        message: 'You do not have permission to delete products'
      });
      return;
    }

    if (confirm('Are you sure you want to delete this product?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setProducts(prev => prev.filter(p => p.id !== productId));
        addNotification({
          type: 'success',
          title: 'Product Deleted',
          message: 'Product has been successfully deleted'
        });
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete product'
        });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (!hasPermission('products', 'delete')) {
      addNotification({
        type: 'error',
        title: 'Permission Denied',
        message: 'You do not have permission to delete products'
      });
      return;
    }

    if (selectedProducts.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
        setSelectedProducts([]);
        addNotification({
          type: 'success',
          title: 'Products Deleted',
          message: `${selectedProducts.length} products have been deleted`
        });
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete products'
        });
      }
    }
  };

  const handleAddProduct = () => {
    setShowAddProductModal(true);
  };

  const handleImport = () => {
    setShowImportModal(true);
  };

  const handleExport = async () => {
    try {
      addNotification({
        type: 'info',
        title: 'Export Started',
        message: 'Your product export is being prepared...'
      });

      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create CSV content
      const csvContent = [
        ['Name', 'Category', 'Price', 'Stock', 'Status'],
        ...filteredProducts.map(product => [
          product.name,
          product.category,
          product.price.toString(),
          product.stock.toString(),
          product.status
        ])
      ].map(row => row.join(',')).join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        title: 'Export Complete',
        message: 'Products have been exported successfully'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export products'
      });
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className={styles.productsPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Products Management</h1>
          <p className={styles.subtitle}>
            Manage your product catalog, inventory, and pricing
          </p>
        </div>
        
        <div className={styles.headerActions}>
          {hasPermission('products', 'create') && (
            <button className={styles.primaryButton} onClick={handleAddProduct}>
              <Plus />
              Add Product
            </button>
          )}
          <button className={styles.secondaryButton} onClick={handleImport}>
            <Upload />
            Import
          </button>
          <button className={styles.secondaryButton} onClick={handleExport}>
            <Download />
            Export
          </button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <button 
            className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter />
            Filters
          </button>

          {showFilters && (
            <div className={styles.filterDropdown}>
              <div className={styles.filterGroup}>
                <label>Category</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Status</label>
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {selectedProducts.length > 0 && (
          <div className={styles.bulkActions}>
            <span className={styles.selectedCount}>
              {selectedProducts.length} selected
            </span>
            <button 
              className={styles.bulkDeleteButton}
              onClick={handleBulkDelete}
            >
              <Trash2 />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                  />
                </td>
                <td>
                  <div className={styles.productCell}>
                    <div className={styles.productImage}>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} />
                      ) : (
                        <div className={styles.imagePlaceholder}>
                          <Eye />
                        </div>
                      )}
                    </div>
                    <div className={styles.productInfo}>
                      <h4 className={styles.productName}>{product.name}</h4>
                      <p className={styles.productDescription}>{product.description}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={styles.category}>{product.category}</span>
                </td>
                <td>
                  <span className={styles.price}>${product.price.toLocaleString()}</span>
                </td>
                <td>
                  <span className={`${styles.stock} ${product.stock === 0 ? styles.outOfStock : ''}`}>
                    {product.stock}
                  </span>
                </td>
                <td>
                  <span className={`${styles.status} ${styles[product.status]}`}>
                    {product.status}
                  </span>
                </td>
                <td>
                  <span className={styles.date}>
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    {hasPermission('products', 'read') && (
                      <button className={styles.actionButton} title="View">
                        <Eye />
                      </button>
                    )}
                    {hasPermission('products', 'update') && (
                      <button className={styles.actionButton} title="Edit">
                        <Edit />
                      </button>
                    )}
                    {hasPermission('products', 'delete') && (
                      <button 
                        className={styles.actionButton} 
                        title="Delete"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 />
                      </button>
                    )}
                    <button className={styles.actionButton} title="More">
                      <MoreHorizontal />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Eye />
            </div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Add New Product</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowAddProductModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <form className={styles.productForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="title">Product Title *</label>
                  <input
                    type="text"
                    id="title"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                    placeholder="Enter product title"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Enter product description"
                    rows={4}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      <option value="fireplaces">Fireplaces</option>
                      <option value="garden">Garden</option>
                      <option value="architectural">Architectural</option>
                      <option value="decorative">Decorative</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      value={newProduct.status}
                      onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="minPrice">Min Price ($)</label>
                    <input
                      type="number"
                      id="minPrice"
                      value={newProduct.priceRange.min}
                      onChange={(e) => setNewProduct({
                        ...newProduct,
                        priceRange: {...newProduct.priceRange, min: Number(e.target.value)}
                      })}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="maxPrice">Max Price ($)</label>
                    <input
                      type="number"
                      id="maxPrice"
                      value={newProduct.priceRange.max}
                      onChange={(e) => setNewProduct({
                        ...newProduct,
                        priceRange: {...newProduct.priceRange, max: Number(e.target.value)}
                      })}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="inventory">Inventory</label>
                    <input
                      type="number"
                      id="inventory"
                      value={newProduct.totalInventory}
                      onChange={(e) => setNewProduct({...newProduct, totalInventory: Number(e.target.value)})}
                      min="0"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="collections">Collections</label>
                  <select
                    id="collections"
                    multiple
                    value={newProduct.collections}
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                      setNewProduct({...newProduct, collections: selectedOptions});
                    }}
                    className={styles.multiSelect}
                  >
                    {collections.map((collection) => (
                      <option key={collection._id} value={collection._id}>
                        {collection.title}
                      </option>
                    ))}
                  </select>
                  <small>Hold Ctrl/Cmd to select multiple collections</small>
                </div>
              </form>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.secondaryButton}
                onClick={() => setShowAddProductModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.primaryButton}
                onClick={handleCreateProduct}
                disabled={!newProduct.title.trim()}
              >
                Create Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Import Products</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowImportModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>Import products from CSV file.</p>
              <div className={styles.uploadArea}>
                <Upload size={48} />
                <p>Drag and drop your CSV file here, or click to browse</p>
                <input type="file" accept=".csv" style={{ display: 'none' }} />
              </div>
              <div className={styles.importInstructions}>
                <h4>CSV Format Requirements:</h4>
                <ul>
                  <li>Name, Category, Price, Stock, Status columns required</li>
                  <li>Price should be numeric (e.g., 29.99)</li>
                  <li>Stock should be integer (e.g., 100)</li>
                  <li>Status should be: active, inactive, or draft</li>
                </ul>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.secondaryButton}
                onClick={() => setShowImportModal(false)}
              >
                Cancel
              </button>
              <button className={styles.primaryButton}>
                Import Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
