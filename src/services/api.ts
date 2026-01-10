const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://samirtal-002-site7.qtempurl.com/api';

// Category types
export interface CategoryDto {
  categoryId: number;
  name: string;
  emoji: string;
}

export interface CreateCategoryDto {
  name: string;
  emoji: string;
}

export interface UpdateCategoryDto {
  name: string;
  emoji: string;
}

// Article types
export interface ArticleDto {
  articleId: number;
  name: string;
  addition: string;
  categoryId: number;
  price: number;
  unit: string;
  status: boolean;
  salePrice?: number;
  pictureUrl?: string;
}

export interface CreateArticleDto {
  name: string;
  addition: string;
  categoryId: number;
  price: number;
  unit: string;
  status: boolean;
  salePrice?: number;
  picture?: File;
}

export interface UpdateArticleDto {
  name: string;
  addition: string;
  categoryId: number;
  price: number;
  unit: string;
  status: boolean;
  salePrice?: number;
  picture?: File;
}

// Order DTOs
export interface ArticleOrderDto {
  articleId: number;
  quantity: number;
}

export interface CreateOrderDto {
  customerName: string;
  phone: string;
  location: string;
  status: string;
  verified: boolean;
  lat: number;
  lng: number;
  articles: ArticleOrderDto[];
  info?: string;
}

export interface UpdateOrderDto {
  customerName: string;
  phone: string;
  location: string;
  status: string;
  verified: boolean;
  lat: number;
  lng: number;
  articles: ArticleOrderDto[];
}

export interface OrderDto {
  orderId: number;
  customerName: string;
  phone: string;
  location: string;
  status: string;
  verified: boolean;
  lat: number;
  lng: number;
  info?: string;

  createdAt: string;
  articleOrders: {
    articleId: number;
    quantity: number;
    totalPrice: number;
    article: ArticleDto;

  }[];
}

// CATEGORY API
export const categoryApi = {
  getAll: async (): Promise<CategoryDto[]> => {
    const response = await fetch(`${API_BASE_URL}/Category`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },
  getById: async (id: number): Promise<CategoryDto> => {
    const response = await fetch(`${API_BASE_URL}/Category/${id}`);
    if (!response.ok) throw new Error('Category not found');
    return response.json();
  },
  create: async (data: CreateCategoryDto): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/Category`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.text();
  },
  update: async (id: number, data: UpdateCategoryDto): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/Category/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.text();
  },
  delete: async (id: number): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/Category/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete category');
    return response.text();
  },
};

// ARTICLE API
export const articleApi = {
  getAll: async (): Promise<ArticleDto[]> => {
    const response = await fetch(`${API_BASE_URL}/Article`);
    if (!response.ok) throw new Error('Failed to fetch articles');
    return response.json();
  },
  getById: async (id: number): Promise<ArticleDto> => {
    const response = await fetch(`${API_BASE_URL}/Article/${id}`);
    if (!response.ok) throw new Error('Article not found');
    return response.json();
  },
  create: async (data: CreateArticleDto): Promise<string> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('addition', data.addition);
    formData.append('categoryId', data.categoryId.toString());
    formData.append('price', data.price.toString());
    formData.append('unit', data.unit);
    formData.append('status', data.status.toString());
    if (data.salePrice !== undefined && data.salePrice !== null) {
      formData.append('salePrice', data.salePrice.toString());
    }
    if (data.picture) {
      formData.append('picture', data.picture);
    }

    const response = await fetch(`${API_BASE_URL}/article`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to create article');
    return response.text();
  },

  update: async (id: number, data: UpdateArticleDto): Promise<string> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('addition', data.addition);
    formData.append('categoryId', data.categoryId.toString());
    formData.append('price', data.price.toString());
    formData.append('unit', data.unit);
    formData.append('status', data.status.toString());
    if (data.salePrice !== undefined && data.salePrice !== null) {
      formData.append('salePrice', data.salePrice.toString());
    }
    if (data.picture) {
      formData.append('picture', data.picture);
    }

    const response = await fetch(`${API_BASE_URL}/article/${id}`, {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to update article');
    return response.text();
  },

  delete: async (id: number): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/Article/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete article');
    return response.text();
  },
};

// ORDER API
export const orderApi = {
  getAll: async (): Promise<OrderDto[]> => {
    const response = await fetch(`${API_BASE_URL}/Order`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },
  getById: async (id: number): Promise<OrderDto> => {
    const response = await fetch(`${API_BASE_URL}/Order/${id}`);
    if (!response.ok) throw new Error('Order not found');
    return response.json();
  },
  create: async (data: CreateOrderDto): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/Order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.text();
  },
  update: async (id: number, data: UpdateOrderDto): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/Order/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update order');
    return response.text();
  },
  delete: async (id: number): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/Order/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete order');
    return response.text();
  },
};
