'use client';

import { useState, useEffect } from 'react';
import { 
  Folder, 
  Plus, 
  Edit, 
  Trash2,
  Search,
  Filter,
  Eye,
  EyeOff,
  Settings,
  Package,
  Tag,
  Calendar,
  Users,
  TrendingUp,
  Grid,
  List,
  Move,
  Copy,
  Download
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import styles from './CollectionsManager.module.css';

interface Collection {
  _id: string;
  title: string;
  description: string;
  handle: string;
  collectionType: 'manual' | 'smart';
  status: 'active' | 'inactive' | 'draft';
  publishedAt?: string;
  seo: {
    title: string;
    description: string;
    slug: string;
  };
  products: string[];
  productCount: number;
  conditions?: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  sortOrder: string;
  image?: {
    url: string;
    altText: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CollectionFormData {
  title: string;
  description: string;
  collectionType: 'manual' | 'smart';
  status: 'active' | 'inactive' | 'draft';
  seo: {
    title: string;
    description: string;
    slug: string;
  };
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  sortOrder: string;
}

export default function CollectionsManager() {
  const { apiCall, hasPermission, addNotification } = useAdmin();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const [formData, setFormData] = useState<CollectionFormData>({
    title: '',
    description: '',
    collectionType: 'manual',
    status: 'draft',
    seo: {
      title: '',
      description: '',
      slug: ''
    },
    conditions: [],
    sortOrder: 'manual'
  });

  // Mock data for demonstration
  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      
      // Mock collections data
      const mockCollections: Collection[] = [
        {
          _id: '1',
          title: 'Architectural Elements',
          description: 'Premium cast stone architectural elements for building enhancement',
          handle: 'architectural-elements',
          collectionType: 'manual',
          status: 'active',
          publishedAt: '2024-01-15T10:00:00Z',
          seo: {
            title: 'Architectural Elements - Cast Stone Collection',
            description: 'Premium cast stone architectural elements collection',
            slug: 'architectural-elements'
          },
          products: ['prod1', 'prod3', 'prod4'],
          productCount: 3,
          sortOrder: 'manual',
          image: {
            url: '/images/collections/architectural.jpg',
            altText: 'Architectural Elements Collection'
          },
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-20T14:30:00Z'
        },
        {
          _id: '2',
          title: 'Garden & Outdoor',
          description: 'Beautiful cast stone pieces for gardens and outdoor spaces',
          handle: 'garden-outdoor',
          collectionType: 'smart',
          status: 'active',
          publishedAt: '2024-01-12T11:00:00Z',
          seo: {
            title: 'Garden & Outdoor - Cast Stone Collection',
            description: 'Beautiful cast stone pieces for gardens and outdoor spaces',
            slug: 'garden-outdoor'
          },
          products: ['prod2', 'prod5'],
          productCount: 2,
          conditions: [
            { field: 'category', operator: 'equals', value: 'Garden' },
            { field: 'tags', operator: 'contains', value: 'outdoor' }
          ],
          sortOrder: 'created_at_desc',
          image: {
            url: '/images/collections/garden.jpg',
            altText: 'Garden & Outdoor Collection'
          },
          createdAt: '2024-01-08T10:00:00Z',
          updatedAt: '2024-01-18T16:20:00Z'
        },
        {
          _id: '3',
          title: 'Featured Products',
          description: 'Our most popular and featured cast stone products',
          handle: 'featured-products',
          collectionType: 'manual',
          status: 'draft',
          seo: {
            title: 'Featured Products - Cast Stone Collection',
            description: 'Our most popular and featured cast stone products',
            slug: 'featured-products'
          },
          products: ['prod1', 'prod2'],
          productCount: 2,
          sortOrder: 'manual',
          createdAt: '2024-01-22T13:00:00Z',
          updatedAt: '2024-01-22T13:00:00Z'
        }
      ];

      setCollections(mockCollections);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load collections'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCollections = collections.filter(collection => {
    const matchesSearch = collection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collection.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || collection.status === statusFilter;
    const matchesType = typeFilter === 'all' || collection.collectionType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateCollection = () => {
    setEditingCollection(null);
    setFormData({
      title: '',
      description: '',
      collectionType: 'manual',
      status: 'draft',
      seo: {
        title: '',
        description: '',
        slug: ''
      },
      conditions: [],
      sortOrder: 'manual'
    });
    setShowCreateModal(true);
  };

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      title: collection.title,
      description: collection.description,
      collectionType: collection.collectionType,
      status: collection.status,
      seo: collection.seo,
      conditions: collection.conditions || [],
      sortOrder: collection.sortOrder
    });
    setShowCreateModal(true);
  };

  const handleDeleteCollection = async (collectionId: string, collectionTitle: string) => {
    if (!hasPermission('products', 'delete')) {
      addNotification({
        type: 'error',
        title: 'Permission Denied',
        message: 'You do not have permission to delete collections'
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete the collection "${collectionTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // API call would go here
      setCollections(prev => prev.filter(c => c._id !== collectionId));
      addNotification({
        type: 'success',
        title: 'Collection Deleted',
        message: `Collection "${collectionTitle}" has been deleted`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete collection'
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Collection title is required'
      });
      return;
    }

    try {
      if (editingCollection) {
        // Update existing collection
        setCollections(prev => prev.map(c => 
          c._id === editingCollection._id 
            ? { ...c, ...formData, updatedAt: new Date().toISOString() }
            : c
        ));
        addNotification({
          type: 'success',
          title: 'Collection Updated',
          message: `Collection "${formData.title}" has been updated`
        });
      } else {
        // Create new collection
        const newCollection: Collection = {
          _id: Date.now().toString(),
          ...formData,
          handle: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          products: [],
          productCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setCollections(prev => [newCollection, ...prev]);
        addNotification({
          type: 'success',
          title: 'Collection Created',
          message: `Collection "${formData.title}" has been created`
        });
      }
      
      setShowCreateModal(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save collection'
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate SEO fields from title
    if (field === 'title') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          title: value,
          slug
        }
      }));
    }
  };

  const handleSEOChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value
      }
    }));
  };

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, { field: 'category', operator: 'equals', value: '' }]
    }));
  };

  const updateCondition = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      )
    }));
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Active', className: styles.statusActive },
      inactive: { label: 'Inactive', className: styles.statusInactive },
      draft: { label: 'Draft', className: styles.statusDraft }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? (
      <span className={`${styles.statusBadge} ${config.className}`}>
        {config.label}
      </span>
    ) : null;
  };

  const getTypeBadge = (type: string) => {
    return (
      <span className={`${styles.typeBadge} ${type === 'smart' ? styles.typeSmart : styles.typeManual}`}>
        {type === 'smart' ? (
          <>
            <Settings size={12} />
            Smart
          </>
        ) : (
          <>
            <Edit size={12} />
            Manual
          </>
        )}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['Title', 'Type', 'Status', 'Products', 'Created', 'Updated'],
      ...filteredCollections.map(collection => [
        collection.title,
        collection.collectionType,
        collection.status,
        collection.productCount.toString(),
        formatDate(collection.createdAt),
        formatDate(collection.updatedAt)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collections-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading collections...</p>
      </div>
    );
  }

  return (
    <div className={styles.collectionsManager}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Collections</h1>
          <p>Organize and manage product collections</p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.exportButton} onClick={handleExport}>
            <Download size={20} />
            Export
          </button>
          {hasPermission('products', 'create') && (
            <button className={styles.createButton} onClick={handleCreateCollection}>
              <Plus size={20} />
              Create Collection
            </button>
          )}
        </div>
      </div>

      {/* Filters and View Controls */}
      <div className={styles.controlsSection}>
        <div className={styles.filtersLeft}>
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Types</option>
            <option value="manual">Manual</option>
            <option value="smart">Smart</option>
          </select>
        </div>

        <div className={styles.viewControls}>
          <button
            onClick={() => setViewMode('grid')}
            className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Collections Display */}
      {viewMode === 'grid' ? (
        <div className={styles.collectionsGrid}>
          {filteredCollections.map((collection) => (
            <div key={collection._id} className={styles.collectionCard}>
              <div className={styles.cardImage}>
                {collection.image ? (
                  <img src={collection.image.url} alt={collection.image.altText} />
                ) : (
                  <div className={styles.placeholderImage}>
                    <Folder size={48} />
                  </div>
                )}
                <div className={styles.cardOverlay}>
                  <div className={styles.cardActions}>
                    <button
                      onClick={() => handleEditCollection(collection)}
                      className={styles.cardAction}
                      title="Edit Collection"
                    >
                      <Edit size={16} />
                    </button>
                    {hasPermission('products', 'delete') && (
                      <button
                        onClick={() => handleDeleteCollection(collection._id, collection.title)}
                        className={styles.cardAction}
                        title="Delete Collection"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{collection.title}</h3>
                  <div className={styles.cardBadges}>
                    {getTypeBadge(collection.collectionType)}
                    {getStatusBadge(collection.status)}
                  </div>
                </div>
                
                <p className={styles.cardDescription}>{collection.description}</p>
                
                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>
                    <Package size={14} />
                    <span>{collection.productCount} products</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Calendar size={14} />
                    <span>Updated {formatDate(collection.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.collectionsTable}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Collection</th>
                <th>Type</th>
                <th>Status</th>
                <th>Products</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCollections.map((collection) => (
                <tr key={collection._id} className={styles.tableRow}>
                  <td>
                    <div className={styles.collectionInfo}>
                      <div className={styles.collectionDetails}>
                        <span className={styles.collectionTitle}>{collection.title}</span>
                        <span className={styles.collectionHandle}>/{collection.handle}</span>
                      </div>
                    </div>
                  </td>
                  <td>{getTypeBadge(collection.collectionType)}</td>
                  <td>{getStatusBadge(collection.status)}</td>
                  <td>
                    <span className={styles.productCount}>{collection.productCount}</span>
                  </td>
                  <td>
                    <span className={styles.date}>{formatDate(collection.createdAt)}</span>
                  </td>
                  <td>
                    <span className={styles.date}>{formatDate(collection.updatedAt)}</span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleEditCollection(collection)}
                        className={styles.actionButton}
                        title="Edit Collection"
                      >
                        <Edit size={16} />
                      </button>
                      {hasPermission('products', 'delete') && (
                        <button
                          onClick={() => handleDeleteCollection(collection._id, collection.title)}
                          className={styles.actionButton}
                          title="Delete Collection"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredCollections.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <Folder size={48} />
          <h3>No collections found</h3>
          <p>Try adjusting your search or filter criteria, or create a new collection.</p>
          {hasPermission('products', 'create') && (
            <button className={styles.createButton} onClick={handleCreateCollection}>
              <Plus size={20} />
              Create Your First Collection
            </button>
          )}
        </div>
      )}

      {/* Create/Edit Collection Modal */}
      {showCreateModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingCollection ? 'Edit Collection' : 'Create New Collection'}</h2>
              <button onClick={() => setShowCreateModal(false)} className={styles.closeButton}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label htmlFor="title">Collection Title *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={styles.input}
                  placeholder="Enter collection title"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={styles.textarea}
                  rows={3}
                  placeholder="Describe your collection"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="collectionType">Collection Type</label>
                  <select
                    id="collectionType"
                    value={formData.collectionType}
                    onChange={(e) => handleInputChange('collectionType', e.target.value)}
                    className={styles.select}
                  >
                    <option value="manual">Manual - Add products manually</option>
                    <option value="smart">Smart - Auto-populate based on conditions</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className={styles.select}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {formData.collectionType === 'smart' && (
                <div className={styles.smartConditions}>
                  <h4>Smart Collection Conditions</h4>
                  <p>Products must match these conditions to be included:</p>
                  
                  {formData.conditions.map((condition, index) => (
                    <div key={index} className={styles.conditionRow}>
                      <select
                        value={condition.field}
                        onChange={(e) => updateCondition(index, 'field', e.target.value)}
                        className={styles.conditionSelect}
                      >
                        <option value="category">Category</option>
                        <option value="tags">Tags</option>
                        <option value="vendor">Vendor</option>
                        <option value="productType">Product Type</option>
                        <option value="price">Price</option>
                      </select>
                      
                      <select
                        value={condition.operator}
                        onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                        className={styles.conditionSelect}
                      >
                        <option value="equals">equals</option>
                        <option value="not_equals">not equals</option>
                        <option value="contains">contains</option>
                        <option value="not_contains">not contains</option>
                        <option value="greater_than">greater than</option>
                        <option value="less_than">less than</option>
                      </select>
                      
                      <input
                        type="text"
                        value={condition.value}
                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                        className={styles.conditionInput}
                        placeholder="Value"
                      />
                      
                      <button
                        type="button"
                        onClick={() => removeCondition(index)}
                        className={styles.removeConditionButton}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addCondition}
                    className={styles.addConditionButton}
                  >
                    <Plus size={16} />
                    Add Condition
                  </button>
                </div>
              )}

              <div className={styles.seoSection}>
                <h4>SEO Settings</h4>
                <div className={styles.formGroup}>
                  <label htmlFor="seoTitle">SEO Title</label>
                  <input
                    type="text"
                    id="seoTitle"
                    value={formData.seo.title}
                    onChange={(e) => handleSEOChange('title', e.target.value)}
                    className={styles.input}
                    placeholder="SEO title for search engines"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="seoDescription">SEO Description</label>
                  <textarea
                    id="seoDescription"
                    value={formData.seo.description}
                    onChange={(e) => handleSEOChange('description', e.target.value)}
                    className={styles.textarea}
                    rows={2}
                    placeholder="SEO description for search engines"
                  />
                </div>
              </div>
            </form>

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="collection-form"
                onClick={handleFormSubmit}
                className={styles.saveButton}
              >
                {editingCollection ? 'Update Collection' : 'Create Collection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
