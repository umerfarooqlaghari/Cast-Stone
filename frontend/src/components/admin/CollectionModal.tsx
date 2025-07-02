'use client';

import { useState, useEffect } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { collectionsApi } from '../../services/api';
import styles from './CollectionModal.module.css';

interface Collection {
  _id?: string;
  title: string;
  handle?: string;
  description: string;
  parent?: string;
  level?: number;
  collectionType: 'manual' | 'smart';
  published: boolean;
  seo?: {
    title?: string;
    description?: string;
    slug?: string;
  };
  image?: {
    url?: string;
    altText?: string;
  };
}

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (collection: Collection) => void;
  collection?: Collection | null;
  parentCollection?: Collection | null;
  mode: 'create' | 'edit';
}

export default function CollectionModal({
  isOpen,
  onClose,
  onSave,
  collection,
  parentCollection,
  mode
}: CollectionModalProps) {
  const [formData, setFormData] = useState<Collection>({
    title: '',
    description: '',
    collectionType: 'manual',
    published: false,
    seo: {
      title: '',
      description: '',
      slug: ''
    },
    image: {
      url: '',
      altText: ''
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [availableParents, setAvailableParents] = useState<Collection[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && collection) {
        setFormData({
          ...collection,
          seo: collection.seo || { title: '', description: '', slug: '' },
          image: collection.image || { url: '', altText: '' }
        });
      } else if (mode === 'create') {
        setFormData({
          title: '',
          description: '',
          collectionType: 'manual',
          published: false,
          parent: parentCollection?._id || '',
          seo: { title: '', description: '', slug: '' },
          image: { url: '', altText: '' }
        });
      }
      fetchAvailableParents();
    }
  }, [isOpen, mode, collection, parentCollection]);

  const fetchAvailableParents = async () => {
    try {
      // Get collections that can be parents (level 0 and 1 only)
      const response = await collectionsApi.getCollections({ 
        limit: 100,
        published: true 
      });
      
      const validParents = response.collections?.filter((c: Collection) => 
        c.level !== undefined && c.level < 2 && c._id !== collection?._id
      ) || [];
      
      setAvailableParents(validParents);
    } catch (error) {
      console.error('Failed to fetch available parents:', error);
    }
  };

  const generateHandle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate handle and SEO slug from title
      if (field === 'title') {
        const handle = generateHandle(value);
        updated.handle = handle;
        if (updated.seo) {
          updated.seo.slug = handle;
          if (!updated.seo.title) {
            updated.seo.title = value;
          }
        }
      }
      
      return updated;
    });
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof Collection],
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.parent) {
      const parent = availableParents.find(p => p._id === formData.parent);
      if (parent && parent.level !== undefined && parent.level >= 2) {
        newErrors.parent = 'Cannot add sub-collection to this level';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save collection:', error);
      setErrors({ submit: 'Failed to save collection. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalTitle = mode === 'create' 
    ? (parentCollection ? `Add Sub-Collection to "${parentCollection.title}"` : 'Create New Collection')
    : `Edit "${collection?.title}"`;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h2>{modalTitle}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGrid}>
            {/* Basic Information */}
            <div className={styles.formSection}>
              <h3>Basic Information</h3>
              
              <div className={styles.formGroup}>
                <label htmlFor="title">Title *</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={errors.title ? styles.inputError : ''}
                  placeholder="Enter collection title"
                />
                {errors.title && <span className={styles.errorText}>{errors.title}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="handle">Handle</label>
                <input
                  id="handle"
                  type="text"
                  value={formData.handle || ''}
                  onChange={(e) => handleInputChange('handle', e.target.value)}
                  placeholder="auto-generated-from-title"
                />
                <small>URL-friendly identifier (auto-generated from title)</small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={errors.description ? styles.inputError : ''}
                  placeholder="Describe this collection"
                  rows={4}
                />
                {errors.description && <span className={styles.errorText}>{errors.description}</span>}
              </div>

              {/* Parent Collection Selection */}
              {mode === 'create' && availableParents.length > 0 && (
                <div className={styles.formGroup}>
                  <label htmlFor="parent">Parent Collection</label>
                  <select
                    id="parent"
                    value={formData.parent || ''}
                    onChange={(e) => handleInputChange('parent', e.target.value)}
                    className={errors.parent ? styles.inputError : ''}
                  >
                    <option value="">Root Collection</option>
                    {availableParents.map((parent) => (
                      <option key={parent._id} value={parent._id}>
                        {'  '.repeat(parent.level || 0)}{parent.title} (Level {parent.level})
                      </option>
                    ))}
                  </select>
                  {errors.parent && <span className={styles.errorText}>{errors.parent}</span>}
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="collectionType">Collection Type</label>
                <select
                  id="collectionType"
                  value={formData.collectionType}
                  onChange={(e) => handleInputChange('collectionType', e.target.value as 'manual' | 'smart')}
                >
                  <option value="manual">Manual (Add products manually)</option>
                  <option value="smart">Smart (Auto-populate based on rules)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => handleInputChange('published', e.target.checked)}
                  />
                  <span>Published</span>
                </label>
                <small>Published collections are visible to customers</small>
              </div>
            </div>

            {/* SEO Settings */}
            <div className={styles.formSection}>
              <h3>SEO Settings</h3>
              
              <div className={styles.formGroup}>
                <label htmlFor="seoTitle">SEO Title</label>
                <input
                  id="seoTitle"
                  type="text"
                  value={formData.seo?.title || ''}
                  onChange={(e) => handleNestedInputChange('seo', 'title', e.target.value)}
                  placeholder="SEO title for search engines"
                  maxLength={70}
                />
                <small>{(formData.seo?.title || '').length}/70 characters</small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="seoDescription">SEO Description</label>
                <textarea
                  id="seoDescription"
                  value={formData.seo?.description || ''}
                  onChange={(e) => handleNestedInputChange('seo', 'description', e.target.value)}
                  placeholder="SEO description for search engines"
                  maxLength={160}
                  rows={3}
                />
                <small>{(formData.seo?.description || '').length}/160 characters</small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="seoSlug">URL Slug</label>
                <input
                  id="seoSlug"
                  type="text"
                  value={formData.seo?.slug || ''}
                  onChange={(e) => handleNestedInputChange('seo', 'slug', e.target.value)}
                  placeholder="url-slug-for-collection"
                />
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className={styles.submitError}>
              <AlertCircle size={16} />
              {errors.submit}
            </div>
          )}

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className={styles.saveButton}>
              {isLoading ? 'Saving...' : (mode === 'create' ? 'Create Collection' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
