const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Auth endpoints
  async register(email: string, password: string, fullName?: string) {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });
  }

  async login(email: string, password: string) {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser() {
    return this.request<{ user: User }>('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Notes endpoints
  async getNotes() {
    return this.request<Note[]>('/notes');
  }

  async getNote(id: string) {
    return this.request<Note>(`/notes/${id}`);
  }

  async createNote(noteData: Partial<Note>) {
    return this.request<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async updateNote(id: string, updates: Partial<Note>) {
    return this.request<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteNote(id: string) {
    return this.request(`/notes/${id}`, { method: 'DELETE' });
  }

  async toggleNoteFavorite(id: string, isFavorite: boolean) {
    return this.request<Note>(`/notes/${id}/favorite`, {
      method: 'PATCH',
      body: JSON.stringify({ is_favorite: isFavorite }),
    });
  }

  // Categories endpoints
  async getCategories() {
    return this.request<Category[]>('/categories');
  }

  async createCategory(name: string, color: string) {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    });
  }

  async updateCategory(id: string, updates: Partial<Category>) {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, { method: 'DELETE' });
  }

  // Tags endpoints
  async getTags() {
    return this.request<Tag[]>('/tags');
  }

  async createTag(name: string, color?: string) {
    return this.request<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    });
  }

  async addTagToNote(tagId: string, noteId: string) {
    return this.request(`/tags/${tagId}/notes/${noteId}`, { method: 'POST' });
  }

  async removeTagFromNote(tagId: string, noteId: string) {
    return this.request(`/tags/${tagId}/notes/${noteId}`, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

// Types
export interface User {
  id: string;
  email: string;
  fullName?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category_id?: string;
  user_id: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  tags?: Tag[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  user_id: string;
  created_at: string;
}