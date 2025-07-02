'use client';

import { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Move,
  Package,
  FolderOpen,
  Folder
} from 'lucide-react';
import { collectionsApi } from '../../services/api';
import styles from './CollectionHierarchy.module.css';

interface Collection {
  _id: string;
  title: string;
  handle: string;
  level: number;
  path: string;
  parent?: string;
  children: Collection[];
  published: boolean;
  productCount?: number;
}

interface CollectionHierarchyProps {
  onSelectCollection?: (collection: Collection) => void;
  onEditCollection?: (collection: Collection) => void;
  onDeleteCollection?: (collection: Collection) => void;
  onAddSubCollection?: (parentCollection: Collection) => void;
  selectedCollectionId?: string;
}

export default function CollectionHierarchy({
  onSelectCollection,
  onEditCollection,
  onDeleteCollection,
  onAddSubCollection,
  selectedCollectionId
}: CollectionHierarchyProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollectionHierarchy();
  }, []);

  const fetchCollectionHierarchy = async () => {
    try {
      setIsLoading(true);
      const response = await collectionsApi.getCollectionHierarchy();
      setCollections(response.collections || []);
      
      // Auto-expand root collections
      const rootIds = response.collections?.map((c: Collection) => c._id) || [];
      setExpandedNodes(new Set(rootIds));
    } catch (error) {
      console.error('Failed to fetch collection hierarchy:', error);
      setError('Failed to load collection hierarchy');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = (collectionId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleSelectCollection = (collection: Collection) => {
    onSelectCollection?.(collection);
  };

  const handleEditCollection = (e: React.MouseEvent, collection: Collection) => {
    e.stopPropagation();
    onEditCollection?.(collection);
  };

  const handleDeleteCollection = (e: React.MouseEvent, collection: Collection) => {
    e.stopPropagation();
    onDeleteCollection?.(collection);
  };

  const handleAddSubCollection = (e: React.MouseEvent, parentCollection: Collection) => {
    e.stopPropagation();
    onAddSubCollection?.(parentCollection);
  };

  const renderCollectionNode = (collection: Collection, depth: number = 0) => {
    const isExpanded = expandedNodes.has(collection._id);
    const isSelected = selectedCollectionId === collection._id;
    const hasChildren = collection.children && collection.children.length > 0;
    const canHaveChildren = collection.level < 2; // Max 3 levels (0, 1, 2)

    return (
      <div key={collection._id} className={styles.collectionNode}>
        <div
          className={`${styles.collectionItem} ${isSelected ? styles.selected : ''}`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onClick={() => handleSelectCollection(collection)}
        >
          <div className={styles.collectionContent}>
            <div className={styles.expandButton}>
              {hasChildren ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(collection._id);
                  }}
                  className={styles.expandToggle}
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <div className={styles.expandSpacer} />
              )}
            </div>

            <div className={styles.collectionIcon}>
              {hasChildren ? (
                isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />
              ) : (
                <Package size={16} />
              )}
            </div>

            <div className={styles.collectionInfo}>
              <span className={styles.collectionTitle}>{collection.title}</span>
              <span className={styles.collectionMeta}>
                Level {collection.level} • {collection.handle}
                {collection.productCount !== undefined && (
                  <> • {collection.productCount} products</>
                )}
              </span>
            </div>

            <div className={styles.collectionStatus}>
              <span className={`${styles.statusBadge} ${collection.published ? styles.published : styles.draft}`}>
                {collection.published ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>

          <div className={styles.collectionActions}>
            {canHaveChildren && (
              <button
                onClick={(e) => handleAddSubCollection(e, collection)}
                className={styles.actionButton}
                title="Add Sub Collection"
              >
                <Plus size={14} />
              </button>
            )}
            <button
              onClick={(e) => handleEditCollection(e, collection)}
              className={styles.actionButton}
              title="Edit Collection"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={(e) => handleDeleteCollection(e, collection)}
              className={styles.actionButton}
              title="Delete Collection"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className={styles.childrenContainer}>
            {collection.children.map((child) => renderCollectionNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading collection hierarchy...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button onClick={fetchCollectionHierarchy} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.hierarchyContainer}>
      <div className={styles.hierarchyHeader}>
        <h3>Collection Hierarchy</h3>
        <button
          onClick={() => onAddSubCollection?.(null as any)}
          className={styles.addRootButton}
        >
          <Plus size={16} />
          Add Root Collection
        </button>
      </div>

      <div className={styles.hierarchyTree}>
        {collections.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={48} />
            <p>No collections found</p>
            <button
              onClick={() => onAddSubCollection?.(null as any)}
              className={styles.addFirstButton}
            >
              Create First Collection
            </button>
          </div>
        ) : (
          collections.map((collection) => renderCollectionNode(collection))
        )}
      </div>
    </div>
  );
}
