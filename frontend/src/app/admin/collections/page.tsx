'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  FolderTree,
  Package,
  Eye,
  Settings
} from 'lucide-react';
import { useAdmin } from '../../../contexts/AdminContext';
import CollectionHierarchy from '../../../components/admin/CollectionHierarchy';
import CollectionModal from '../../../components/admin/CollectionModal';
import { collectionsApi } from '../../../services/api';
import styles from './page.module.css';

interface Collection {
  _id: string;
  title: string;
  handle: string;
  description: string;
  level: number;
  path: string;
  parent?: string;
  children: Collection[];
  published: boolean;
  productCount?: number;
  collectionType: 'manual' | 'smart';
  createdAt: string;
  updatedAt: string;
}

export default function CollectionsManagement() {
  const { hasPermission, addNotification } = useAdmin();
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [parentCollection, setParentCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectCollection = (collection: Collection) => {
    setSelectedCollection(collection);
  };

  const handleEditCollection = (collection: Collection) => {
    setSelectedCollection(collection);
    setModalMode('edit');
    setShowCollectionModal(true);
  };

  const handleDeleteCollection = async (collection: Collection) => {
    if (!hasPermission('products', 'delete')) {
      addNotification({
        type: 'error',
        title: 'Permission Denied',
        message: 'You do not have permission to delete collections'
      });
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${collection.title}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setIsLoading(true);
      // TODO: Implement delete API call
      // await collectionsApi.deleteCollection(collection._id);
      
      addNotification({
        type: 'success',
        title: 'Collection Deleted',
        message: `"${collection.title}" has been deleted successfully`
      });
      
      setRefreshKey(prev => prev + 1);
      if (selectedCollection?._id === collection._id) {
        setSelectedCollection(null);
      }
    } catch (error) {
      console.error('Failed to delete collection:', error);
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete collection. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubCollection = (parent: Collection | null) => {
    setParentCollection(parent);
    setSelectedCollection(null);
    setModalMode('create');
    setShowCollectionModal(true);
  };

  const handleSaveCollection = async (collectionData: any) => {
    try {
      setIsLoading(true);
      
      if (modalMode === 'create') {
        // TODO: Implement create API call
        // await collectionsApi.createCollection(collectionData);
        addNotification({
          type: 'success',
          title: 'Collection Created',
          message: `"${collectionData.title}" has been created successfully`
        });
      } else {
        // TODO: Implement update API call
        // await collectionsApi.updateCollection(selectedCollection!._id, collectionData);
        addNotification({
          type: 'success',
          title: 'Collection Updated',
          message: `"${collectionData.title}" has been updated successfully`
        });
      }
      
      setRefreshKey(prev => prev + 1);
      setShowCollectionModal(false);
    } catch (error) {
      console.error('Failed to save collection:', error);
      throw error; // Re-throw to let modal handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowCollectionModal(false);
    setSelectedCollection(null);
    setParentCollection(null);
  };

  return (
    <div className={styles.collectionsPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Collections Management</h1>
          <p className={styles.subtitle}>
            Manage your hierarchical collection structure and organize products
          </p>
        </div>
        
        <div className={styles.headerActions}>
          {hasPermission('products', 'create') && (
            <button 
              className={styles.primaryButton} 
              onClick={() => handleAddSubCollection(null)}
            >
              <Plus />
              Add Root Collection
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <CollectionHierarchy
            key={refreshKey}
            onSelectCollection={handleSelectCollection}
            onEditCollection={handleEditCollection}
            onDeleteCollection={handleDeleteCollection}
            onAddSubCollection={handleAddSubCollection}
            selectedCollectionId={selectedCollection?._id}
          />
        </div>

        <div className={styles.mainContent}>
          {selectedCollection ? (
            <div className={styles.collectionDetails}>
              <div className={styles.detailsHeader}>
                <div className={styles.collectionInfo}>
                  <h2>{selectedCollection.title}</h2>
                  <div className={styles.collectionMeta}>
                    <span className={styles.metaItem}>
                      <Package size={16} />
                      Level {selectedCollection.level}
                    </span>
                    <span className={styles.metaItem}>
                      <FolderTree size={16} />
                      {selectedCollection.path}
                    </span>
                    <span className={`${styles.statusBadge} ${selectedCollection.published ? styles.published : styles.draft}`}>
                      {selectedCollection.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                
                <div className={styles.detailsActions}>
                  {hasPermission('products', 'update') && (
                    <button
                      onClick={() => handleEditCollection(selectedCollection)}
                      className={styles.secondaryButton}
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                  )}
                  <button className={styles.secondaryButton}>
                    <Eye size={16} />
                    View Products
                  </button>
                </div>
              </div>

              <div className={styles.detailsContent}>
                <div className={styles.descriptionSection}>
                  <h3>Description</h3>
                  <p>{selectedCollection.description || 'No description provided.'}</p>
                </div>

                <div className={styles.statsSection}>
                  <h3>Statistics</h3>
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <div className={styles.statValue}>
                        {selectedCollection.productCount || 0}
                      </div>
                      <div className={styles.statLabel}>Products</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statValue}>
                        {selectedCollection.children?.length || 0}
                      </div>
                      <div className={styles.statLabel}>Sub Collections</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statValue}>
                        {selectedCollection.collectionType}
                      </div>
                      <div className={styles.statLabel}>Type</div>
                    </div>
                  </div>
                </div>

                {selectedCollection.children && selectedCollection.children.length > 0 && (
                  <div className={styles.childrenSection}>
                    <h3>Sub Collections</h3>
                    <div className={styles.childrenGrid}>
                      {selectedCollection.children.map((child) => (
                        <div
                          key={child._id}
                          className={styles.childCard}
                          onClick={() => setSelectedCollection(child)}
                        >
                          <div className={styles.childIcon}>
                            <Package size={20} />
                          </div>
                          <div className={styles.childInfo}>
                            <h4>{child.title}</h4>
                            <p>Level {child.level} • {child.handle}</p>
                          </div>
                          <div className={`${styles.childStatus} ${child.published ? styles.published : styles.draft}`}>
                            {child.published ? 'Published' : 'Draft'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <FolderTree size={64} />
              <h3>Select a Collection</h3>
              <p>Choose a collection from the hierarchy to view its details and manage its settings.</p>
            </div>
          )}
        </div>
      </div>

      {/* Collection Modal */}
      {showCollectionModal && (
        <CollectionModal
          isOpen={showCollectionModal}
          onClose={handleCloseModal}
          onSave={handleSaveCollection}
          collection={modalMode === 'edit' ? selectedCollection : null}
          parentCollection={parentCollection}
          mode={modalMode}
        />
      )}
    </div>
  );
}
