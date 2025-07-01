'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Upload,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { useAdmin } from '../../../contexts/AdminContext';
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

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProducts([
          {
            id: '1',
            name: 'Classic Fireplace Mantel',
            category: 'fireplaces',
            price: 2500,
            stock: 12,
            status: 'active',
            imageUrl: '/images/fireplace-collection.jpg',
            description: 'Handcrafted traditional mantel with intricate detailing',
            createdAt: '2024-01-10',
            updatedAt: '2024-01-15'
          },
          {
            id: '2',
            name: 'Modern Fireplace Surround',
            category: 'fireplaces',
            price: 3200,
            stock: 8,
            status: 'active',
            imageUrl: '/images/fireplace-collection.jpg',
            description: 'Contemporary design with clean lines',
            createdAt: '2024-01-12',
            updatedAt: '2024-01-14'
          },
          {
            id: '3',
            name: 'Garden Fountain',
            category: 'garden',
            price: 1800,
            stock: 5,
            status: 'active',
            imageUrl: '/images/garden-collection.jpg',
            description: 'Three-tier fountain perfect for outdoor spaces',
            createdAt: '2024-01-08',
            updatedAt: '2024-01-13'
          },
          {
            id: '4',
            name: 'Decorative Columns',
            category: 'architectural',
            price: 1200,
            stock: 0,
            status: 'inactive',
            imageUrl: '/images/architectural-collection.jpg',
            description: 'Corinthian style columns for grand entrances',
            createdAt: '2024-01-05',
            updatedAt: '2024-01-10'
          }
        ]);
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
    };

    fetchProducts();
  }, [addNotification]);

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
            <button className={styles.primaryButton}>
              <Plus />
              Add Product
            </button>
          )}
          <button className={styles.secondaryButton}>
            <Upload />
            Import
          </button>
          <button className={styles.secondaryButton}>
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
    </div>
  );
}
