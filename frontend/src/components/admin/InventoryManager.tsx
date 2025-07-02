'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Plus,
  Minus,
  RotateCcw,
  MapPin,
  Truck,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import styles from './InventoryManager.module.css';

interface InventoryItem {
  _id: string;
  productId: string;
  productTitle: string;
  sku: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  cost: number;
  locations: Array<{
    locationId: string;
    locationName: string;
    quantity: number;
  }>;
  movements: Array<{
    type: 'in' | 'out' | 'adjustment' | 'transfer';
    quantity: number;
    reason: string;
    date: string;
    reference?: string;
  }>;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  lastUpdated: string;
}

interface InventoryFilters {
  search: string;
  status: string;
  location: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function InventoryManager() {
  const { apiCall, hasPermission, addNotification } = useAdmin();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    status: 'all',
    location: 'all',
    sortBy: 'productTitle',
    sortOrder: 'asc'
  });

  const [adjustmentForm, setAdjustmentForm] = useState({
    type: 'adjustment' as 'in' | 'out' | 'adjustment',
    quantity: 0,
    reason: '',
    reference: ''
  });

  const [transferForm, setTransferForm] = useState({
    fromLocation: '',
    toLocation: '',
    quantity: 0,
    reason: ''
  });

  // Mock data for demonstration
  useEffect(() => {
    fetchInventory();
  }, [filters]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      
      // Mock inventory data
      const mockInventory: InventoryItem[] = [
        {
          _id: '1',
          productId: 'prod1',
          productTitle: 'Classic Stone Pillar',
          sku: 'CSP-001-STD',
          currentStock: 25,
          reservedStock: 3,
          availableStock: 22,
          reorderPoint: 10,
          reorderQuantity: 50,
          cost: 150.00,
          locations: [
            { locationId: 'warehouse1', locationName: 'Main Warehouse', quantity: 20 },
            { locationId: 'showroom1', locationName: 'Showroom', quantity: 5 }
          ],
          movements: [
            { type: 'in', quantity: 50, reason: 'Purchase Order #1001', date: '2024-01-15', reference: 'PO-1001' },
            { type: 'out', quantity: 25, reason: 'Sales Order #2001', date: '2024-01-20', reference: 'SO-2001' }
          ],
          status: 'in_stock',
          lastUpdated: '2024-01-20T10:30:00Z'
        },
        {
          _id: '2',
          productId: 'prod2',
          productTitle: 'Decorative Garden Fountain',
          sku: 'DGF-001-MED',
          currentStock: 3,
          reservedStock: 1,
          availableStock: 2,
          reorderPoint: 5,
          reorderQuantity: 10,
          cost: 450.00,
          locations: [
            { locationId: 'warehouse1', locationName: 'Main Warehouse', quantity: 3 }
          ],
          movements: [
            { type: 'in', quantity: 10, reason: 'Purchase Order #1002', date: '2024-01-10', reference: 'PO-1002' },
            { type: 'out', quantity: 7, reason: 'Sales Orders', date: '2024-01-18', reference: 'Multiple' }
          ],
          status: 'low_stock',
          lastUpdated: '2024-01-18T14:20:00Z'
        },
        {
          _id: '3',
          productId: 'prod3',
          productTitle: 'Ornate Window Surround',
          sku: 'OWS-001-STD',
          currentStock: 0,
          reservedStock: 0,
          availableStock: 0,
          reorderPoint: 8,
          reorderQuantity: 20,
          cost: 230.00,
          locations: [],
          movements: [
            { type: 'out', quantity: 15, reason: 'Large Order #2010', date: '2024-01-22', reference: 'SO-2010' }
          ],
          status: 'out_of_stock',
          lastUpdated: '2024-01-22T09:15:00Z'
        }
      ];

      setInventory(mockInventory);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load inventory data'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
                         item.sku.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || item.status === filters.status;
    const matchesLocation = filters.location === 'all' || 
                           item.locations.some(loc => loc.locationId === filters.location);
    
    return matchesSearch && matchesStatus && matchesLocation;
  }).sort((a, b) => {
    const aValue = a[filters.sortBy as keyof InventoryItem];
    const bValue = b[filters.sortBy as keyof InventoryItem];
    
    if (filters.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <CheckCircle className={styles.statusInStock} size={16} />;
      case 'low_stock':
        return <AlertTriangle className={styles.statusLowStock} size={16} />;
      case 'out_of_stock':
        return <XCircle className={styles.statusOutOfStock} size={16} />;
      case 'discontinued':
        return <Clock className={styles.statusDiscontinued} size={16} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock': return 'In Stock';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      case 'discontinued': return 'Discontinued';
      default: return status;
    }
  };

  const handleStockAdjustment = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustmentForm({
      type: 'adjustment',
      quantity: 0,
      reason: '',
      reference: ''
    });
    setShowAdjustmentModal(true);
  };

  const handleStockTransfer = (item: InventoryItem) => {
    setSelectedItem(item);
    setTransferForm({
      fromLocation: item.locations[0]?.locationId || '',
      toLocation: '',
      quantity: 0,
      reason: ''
    });
    setShowTransferModal(true);
  };

  const submitAdjustment = async () => {
    if (!selectedItem || adjustmentForm.quantity === 0) return;

    try {
      // API call would go here
      addNotification({
        type: 'success',
        title: 'Stock Adjusted',
        message: `Stock for ${selectedItem.productTitle} has been updated`
      });
      
      setShowAdjustmentModal(false);
      fetchInventory();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to adjust stock'
      });
    }
  };

  const submitTransfer = async () => {
    if (!selectedItem || transferForm.quantity === 0) return;

    try {
      // API call would go here
      addNotification({
        type: 'success',
        title: 'Stock Transferred',
        message: `Stock transferred successfully`
      });
      
      setShowTransferModal(false);
      fetchInventory();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to transfer stock'
      });
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Product', 'SKU', 'Current Stock', 'Available', 'Reserved', 'Reorder Point', 'Status', 'Last Updated'],
      ...filteredInventory.map(item => [
        item.productTitle,
        item.sku,
        item.currentStock.toString(),
        item.availableStock.toString(),
        item.reservedStock.toString(),
        item.reorderPoint.toString(),
        getStatusLabel(item.status),
        new Date(item.lastUpdated).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className={styles.inventoryManager}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Inventory Management</h1>
          <p>Track and manage product inventory across all locations</p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.exportButton} onClick={handleExport}>
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <div className={styles.cardIcon}>
            <Package size={24} />
          </div>
          <div className={styles.cardContent}>
            <h3>{inventory.length}</h3>
            <p>Total Products</p>
          </div>
        </div>
        
        <div className={styles.summaryCard}>
          <div className={styles.cardIcon}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.cardContent}>
            <h3>{inventory.filter(i => i.status === 'in_stock').length}</h3>
            <p>In Stock</p>
          </div>
        </div>
        
        <div className={styles.summaryCard}>
          <div className={styles.cardIcon}>
            <AlertTriangle size={24} />
          </div>
          <div className={styles.cardContent}>
            <h3>{inventory.filter(i => i.status === 'low_stock').length}</h3>
            <p>Low Stock</p>
          </div>
        </div>
        
        <div className={styles.summaryCard}>
          <div className={styles.cardIcon}>
            <XCircle size={24} />
          </div>
          <div className={styles.cardContent}>
            <h3>{inventory.filter(i => i.status === 'out_of_stock').length}</h3>
            <p>Out of Stock</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search products or SKUs..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className={styles.searchInput}
          />
        </div>
        
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="discontinued">Discontinued</option>
        </select>

        <select
          value={filters.location}
          onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
          className={styles.filterSelect}
        >
          <option value="all">All Locations</option>
          <option value="warehouse1">Main Warehouse</option>
          <option value="showroom1">Showroom</option>
        </select>

        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            setFilters(prev => ({ ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }));
          }}
          className={styles.filterSelect}
        >
          <option value="productTitle-asc">Name A-Z</option>
          <option value="productTitle-desc">Name Z-A</option>
          <option value="currentStock-asc">Stock Low-High</option>
          <option value="currentStock-desc">Stock High-Low</option>
          <option value="lastUpdated-desc">Recently Updated</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Current Stock</th>
              <th>Available</th>
              <th>Reserved</th>
              <th>Reorder Point</th>
              <th>Status</th>
              <th>Locations</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => (
              <tr key={item._id} className={styles.tableRow}>
                <td>
                  <div className={styles.productInfo}>
                    <div className={styles.productDetails}>
                      <span className={styles.productTitle}>{item.productTitle}</span>
                      <span className={styles.productSku}>{item.sku}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={styles.stockNumber}>{item.currentStock}</span>
                </td>
                <td>
                  <span className={styles.stockNumber}>{item.availableStock}</span>
                </td>
                <td>
                  <span className={styles.reservedStock}>{item.reservedStock}</span>
                </td>
                <td>
                  <span className={styles.reorderPoint}>{item.reorderPoint}</span>
                </td>
                <td>
                  <div className={styles.status}>
                    {getStatusIcon(item.status)}
                    <span>{getStatusLabel(item.status)}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.locations}>
                    {item.locations.map((location, index) => (
                      <span key={index} className={styles.location}>
                        <MapPin size={12} />
                        {location.locationName}: {location.quantity}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleStockAdjustment(item)}
                      className={styles.actionButton}
                      title="Adjust Stock"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleStockTransfer(item)}
                      className={styles.actionButton}
                      title="Transfer Stock"
                    >
                      <Truck size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustmentModal && selectedItem && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Adjust Stock - {selectedItem.productTitle}</h3>
              <button onClick={() => setShowAdjustmentModal(false)} className={styles.closeButton}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.currentStock}>
                <p>Current Stock: <strong>{selectedItem.currentStock}</strong></p>
              </div>
              
              <div className={styles.formGroup}>
                <label>Adjustment Type</label>
                <select
                  value={adjustmentForm.type}
                  onChange={(e) => setAdjustmentForm(prev => ({ ...prev, type: e.target.value as any }))}
                  className={styles.select}
                >
                  <option value="in">Stock In (+)</option>
                  <option value="out">Stock Out (-)</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={adjustmentForm.quantity}
                  onChange={(e) => setAdjustmentForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Reason</label>
                <input
                  type="text"
                  value={adjustmentForm.reason}
                  onChange={(e) => setAdjustmentForm(prev => ({ ...prev, reason: e.target.value }))}
                  className={styles.input}
                  placeholder="Reason for adjustment"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Reference (Optional)</label>
                <input
                  type="text"
                  value={adjustmentForm.reference}
                  onChange={(e) => setAdjustmentForm(prev => ({ ...prev, reference: e.target.value }))}
                  className={styles.input}
                  placeholder="PO number, invoice, etc."
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowAdjustmentModal(false)} className={styles.cancelButton}>
                Cancel
              </button>
              <button onClick={submitAdjustment} className={styles.saveButton}>
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {showTransferModal && selectedItem && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Transfer Stock - {selectedItem.productTitle}</h3>
              <button onClick={() => setShowTransferModal(false)} className={styles.closeButton}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>From Location</label>
                <select
                  value={transferForm.fromLocation}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, fromLocation: e.target.value }))}
                  className={styles.select}
                >
                  {selectedItem.locations.map(location => (
                    <option key={location.locationId} value={location.locationId}>
                      {location.locationName} ({location.quantity} available)
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>To Location</label>
                <select
                  value={transferForm.toLocation}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, toLocation: e.target.value }))}
                  className={styles.select}
                >
                  <option value="">Select destination</option>
                  <option value="warehouse1">Main Warehouse</option>
                  <option value="showroom1">Showroom</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Quantity to Transfer</label>
                <input
                  type="number"
                  min="1"
                  value={transferForm.quantity}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Reason</label>
                <input
                  type="text"
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, reason: e.target.value }))}
                  className={styles.input}
                  placeholder="Reason for transfer"
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowTransferModal(false)} className={styles.cancelButton}>
                Cancel
              </button>
              <button onClick={submitTransfer} className={styles.saveButton}>
                Transfer Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredInventory.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <Package size={48} />
          <h3>No inventory items found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
