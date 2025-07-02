'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Upload, 
  Plus, 
  Trash2,
  Eye,
  EyeOff,
  DollarSign,
  Package,
  Tag,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import styles from './ProductForm.module.css';

interface ProductFormData {
  title: string;
  description: string;
  vendor: string;
  productType: string;
  category: string;
  tags: string[];
  status: 'active' | 'inactive' | 'draft';
  handle: string;
  seo: {
    title: string;
    description: string;
    slug: string;
  };
  variants: Array<{
    title: string;
    price: number;
    compareAtPrice?: number;
    sku: string;
    inventoryQuantity: number;
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  }>;
  images: Array<{
    url: string;
    altText: string;
  }>;
  options: Array<{
    name: string;
    values: string[];
  }>;
}

interface ProductFormProps {
  product?: any;
  onSave: (productData: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ProductForm({ product, onSave, onCancel, isLoading }: ProductFormProps) {
  const { addNotification } = useAdmin();
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    vendor: 'Cast Stone Creations',
    productType: 'Physical',
    category: '',
    tags: [],
    status: 'draft',
    handle: '',
    seo: {
      title: '',
      description: '',
      slug: ''
    },
    variants: [{
      title: 'Default Title',
      price: 0,
      compareAtPrice: 0,
      sku: '',
      inventoryQuantity: 0,
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0
      }
    }],
    images: [],
    options: []
  });

  const [activeTab, setActiveTab] = useState('general');
  const [newTag, setNewTag] = useState('');
  const [newOption, setNewOption] = useState({ name: '', values: [''] });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        vendor: product.vendor || 'Cast Stone Creations',
        productType: product.productType || 'Physical',
        category: product.category || '',
        tags: product.tags || [],
        status: product.status || 'draft',
        handle: product.handle || '',
        seo: {
          title: product.seo?.title || '',
          description: product.seo?.description || '',
          slug: product.seo?.slug || ''
        },
        variants: product.variants || [{
          title: 'Default Title',
          price: 0,
          compareAtPrice: 0,
          sku: '',
          inventoryQuantity: 0,
          weight: 0,
          dimensions: { length: 0, width: 0, height: 0 }
        }],
        images: product.images || [],
        options: product.options || []
      });
    }
  }, [product]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate handle and SEO slug from title
    if (field === 'title') {
      const handle = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormData(prev => ({
        ...prev,
        handle,
        seo: {
          ...prev.seo,
          title: value,
          slug: handle
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

  const handleVariantChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const handleDimensionChange = (variantIndex: number, dimension: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === variantIndex ? {
          ...variant,
          dimensions: { ...variant.dimensions, [dimension]: value }
        } : variant
      )
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        title: `Variant ${prev.variants.length + 1}`,
        price: 0,
        compareAtPrice: 0,
        sku: '',
        inventoryQuantity: 0,
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 }
      }]
    }));
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index)
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addOption = () => {
    if (newOption.name.trim()) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, {
          name: newOption.name.trim(),
          values: newOption.values.filter(v => v.trim())
        }]
      }));
      setNewOption({ name: '', values: [''] });
    }
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Product title is required'
      });
      return;
    }

    if (formData.variants.some(v => v.price <= 0)) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'All variants must have a valid price'
      });
      return;
    }

    onSave(formData);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FileText },
    { id: 'pricing', label: 'Pricing & Variants', icon: DollarSign },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'seo', label: 'SEO & Visibility', icon: Eye },
    { id: 'media', label: 'Media', icon: ImageIcon }
  ];

  return (
    <div className={styles.productForm}>
      <div className={styles.formHeader}>
        <h2>{product ? 'Edit Product' : 'Create New Product'}</h2>
        <div className={styles.formActions}>
          <button 
            type="button" 
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={isLoading}
          >
            <X size={20} />
            Cancel
          </button>
          <button 
            type="submit" 
            form="product-form"
            className={styles.saveButton}
            disabled={isLoading}
          >
            <Save size={20} />
            {isLoading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>

      <div className={styles.formTabs}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form id="product-form" onSubmit={handleSubmit} className={styles.form}>
        {activeTab === 'general' && (
          <div className={styles.tabContent}>
            <div className={styles.section}>
              <h3>Basic Information</h3>
              <div className={styles.formGroup}>
                <label htmlFor="title">Product Title *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={styles.input}
                  placeholder="Enter product title"
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
                  rows={4}
                  placeholder="Describe your product"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="vendor">Vendor</label>
                  <input
                    type="text"
                    id="vendor"
                    value={formData.vendor}
                    onChange={(e) => handleInputChange('vendor', e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="productType">Product Type</label>
                  <select
                    id="productType"
                    value={formData.productType}
                    onChange={(e) => handleInputChange('productType', e.target.value)}
                    className={styles.select}
                  >
                    <option value="Physical">Physical</option>
                    <option value="Digital">Digital</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Select Category</option>
                    <option value="Architectural">Architectural</option>
                    <option value="Garden">Garden</option>
                    <option value="Decorative">Decorative</option>
                    <option value="Structural">Structural</option>
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
            </div>

            <div className={styles.section}>
              <h3>Tags</h3>
              <div className={styles.tagsContainer}>
                <div className={styles.tagsList}>
                  {formData.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className={styles.tagRemove}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className={styles.addTag}>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className={styles.input}
                    placeholder="Add tag"
                  />
                  <button type="button" onClick={addTag} className={styles.addButton}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className={styles.tabContent}>
            <div className={styles.section}>
              <h3>Product Variants</h3>
              {formData.variants.map((variant, index) => (
                <div key={index} className={styles.variantCard}>
                  <div className={styles.variantHeader}>
                    <h4>Variant {index + 1}</h4>
                    {formData.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className={styles.removeButton}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Variant Title</label>
                      <input
                        type="text"
                        value={variant.title}
                        onChange={(e) => handleVariantChange(index, 'title', e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>SKU</label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                        className={styles.input}
                        placeholder="Product SKU"
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)}
                        className={styles.input}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Compare at Price</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={variant.compareAtPrice || ''}
                        onChange={(e) => handleVariantChange(index, 'compareAtPrice', parseFloat(e.target.value) || 0)}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Weight (lbs)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={variant.weight}
                        onChange={(e) => handleVariantChange(index, 'weight', parseFloat(e.target.value) || 0)}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Inventory Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={variant.inventoryQuantity}
                        onChange={(e) => handleVariantChange(index, 'inventoryQuantity', parseInt(e.target.value) || 0)}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.dimensionsGroup}>
                    <label>Dimensions (inches)</label>
                    <div className={styles.dimensionsRow}>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={variant.dimensions.length}
                        onChange={(e) => handleDimensionChange(index, 'length', parseFloat(e.target.value) || 0)}
                        className={styles.input}
                        placeholder="Length"
                      />
                      <span>×</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={variant.dimensions.width}
                        onChange={(e) => handleDimensionChange(index, 'width', parseFloat(e.target.value) || 0)}
                        className={styles.input}
                        placeholder="Width"
                      />
                      <span>×</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={variant.dimensions.height}
                        onChange={(e) => handleDimensionChange(index, 'height', parseFloat(e.target.value) || 0)}
                        className={styles.input}
                        placeholder="Height"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" onClick={addVariant} className={styles.addVariantButton}>
                <Plus size={16} />
                Add Variant
              </button>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className={styles.tabContent}>
            <div className={styles.section}>
              <h3>Search Engine Optimization</h3>
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
                  rows={3}
                  placeholder="SEO description for search engines"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="handle">URL Handle</label>
                <input
                  type="text"
                  id="handle"
                  value={formData.handle}
                  onChange={(e) => handleInputChange('handle', e.target.value)}
                  className={styles.input}
                  placeholder="url-handle"
                />
                <small>This will be used in the product URL</small>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className={styles.tabContent}>
            <div className={styles.section}>
              <h3>Product Images</h3>
              <div className={styles.mediaUpload}>
                <div className={styles.uploadArea}>
                  <Upload size={48} />
                  <p>Drag and drop images here, or click to browse</p>
                  <input type="file" multiple accept="image/*" style={{ display: 'none' }} />
                </div>
              </div>

              {formData.images.length > 0 && (
                <div className={styles.imagesList}>
                  {formData.images.map((image, index) => (
                    <div key={index} className={styles.imageItem}>
                      <img src={image.url} alt={image.altText} />
                      <div className={styles.imageActions}>
                        <input
                          type="text"
                          value={image.altText}
                          onChange={(e) => {
                            const newImages = [...formData.images];
                            newImages[index].altText = e.target.value;
                            setFormData(prev => ({ ...prev, images: newImages }));
                          }}
                          placeholder="Alt text"
                          className={styles.input}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = formData.images.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, images: newImages }));
                          }}
                          className={styles.removeButton}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
