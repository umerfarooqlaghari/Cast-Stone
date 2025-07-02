/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CartItem, ShippingInfo } from '../store/cartStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// API Response types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface CartResponse {
  cart: {
    _id: string;
    userId: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
}

interface OrderResponse {
  order: {
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
  };
}

// Error handling utility
class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Request utility with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get auth token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code
      );
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new ApiError(data.message || 'API request failed', undefined, data.code);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network error. Please check your connection.', 0, 'NETWORK_ERROR');
    }
    
    throw new ApiError('An unexpected error occurred.', 0, 'UNKNOWN_ERROR');
  }
}

// Cart API
export const cartApi = {
  // Get user's cart
  async getCart(): Promise<CartResponse> {
    return apiRequest<CartResponse>('/cart');
  },

  // Add item to cart
  async addToCart(productId: string, quantity: number = 1): Promise<CartResponse> {
    return apiRequest<CartResponse>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  // Update item quantity
  async updateCartItem(productId: string, quantity: number): Promise<CartResponse> {
    return apiRequest<CartResponse>(`/cart/item/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  // Remove item from cart
  async removeFromCart(productId: string): Promise<CartResponse> {
    return apiRequest<CartResponse>(`/cart/item/${productId}`, {
      method: 'DELETE',
    });
  },

  // Clear entire cart
  async clearCart(): Promise<CartResponse> {
    return apiRequest<CartResponse>('/cart/clear', {
      method: 'DELETE',
    });
  },

  // Sync cart with frontend
  async syncCart(items: CartItem[]): Promise<CartResponse> {
    return apiRequest<CartResponse>('/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },
};

// Orders API
export const ordersApi = {
  // Create payment intent
  async createPaymentIntent(amount: number): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const response = await apiRequest<{ clientSecret: string; paymentIntentId: string }>('/orders/payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
    return response;
  },

  // Create order after successful payment
  async createOrder(
    paymentIntentId: string,
    shippingAddress: ShippingInfo,
    paymentMethod?: string
  ): Promise<OrderResponse> {
    return apiRequest<OrderResponse>('/orders/create', {
      method: 'POST',
      body: JSON.stringify({
        paymentIntentId,
        shippingAddress,
        paymentMethod,
      }),
    });
  },

  // Get user's orders
  async getUserOrders(page: number = 1, limit: number = 10): Promise<{
    orders: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return apiRequest(`/orders?page=${page}&limit=${limit}`);
  },

  // Get specific order
  async getOrder(orderNumber: string): Promise<{ order: any }> {
    return apiRequest(`/orders/${orderNumber}`);
  },

  // Handle payment failure
  async handlePaymentFailure(paymentIntentId: string, error: any): Promise<void> {
    return apiRequest('/orders/payment-failure', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, error }),
    });
  },
};

// Products API (if needed for cart integration)
export const productsApi = {
  // Get all products
  async getProducts(category?: string, tags?: string): Promise<{ products: any[] }> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (tags) params.append('tags', tags);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    return apiRequest(endpoint);
  },

  // Get single product
  async getProduct(id: string): Promise<{ product: any }> {
    return apiRequest(`/products/${id}`);
  },
};

// Retry utility for failed requests
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx) except 408, 429
      if (error instanceof ApiError && error.status) {
        if (error.status >= 400 && error.status < 500 && 
            error.status !== 408 && error.status !== 429) {
          throw error;
        }
      }

      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError!;
};

// Offline detection and queue
export const offlineQueue: Array<() => Promise<any>> = [];

export const addToOfflineQueue = (requestFn: () => Promise<any>) => {
  offlineQueue.push(requestFn);
};

export const processOfflineQueue = async () => {
  if (!navigator.onLine || offlineQueue.length === 0) return;

  const requests = [...offlineQueue];
  offlineQueue.length = 0; // Clear the queue

  for (const request of requests) {
    try {
      await request();
    } catch (error) {
      console.error('Failed to process offline request:', error);
      // Re-add to queue if it fails
      offlineQueue.push(request);
    }
  }
};

// Listen for online events to process queue
if (typeof window !== 'undefined') {
  window.addEventListener('online', processOfflineQueue);
}

export { ApiError };
