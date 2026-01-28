// API client utilities for calling Express backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Helper function to handle API calls with credentials
async function fetchWithCredentials(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Important for cookies/sessions
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Don't throw for 401/403 - let caller handle
      if (response.status === 401 || response.status === 403) {
        return response;
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// Recipe API
export const recipeApi = {
  // Get homepage data
  getHomepage: async () => {
    const response = await fetchWithCredentials(`${API_BASE_URL}/`);
    const html = await response.text();
    // For now, we'll need to parse or use server-side rendering
    return html;
  },

  // Get recipe by ID
  getRecipe: async (id: string) => {
    const response = await fetchWithCredentials(`${API_BASE_URL}/recipe/${id}`);
    return response.json();
  },

  // Get categories
  getCategories: async () => {
    const response = await fetchWithCredentials(`${API_BASE_URL}/categories`);
    return response.json();
  },

  // Search recipes
  searchRecipes: async (searchTerm: string, searchType: 'name' | 'ingredients') => {
    const formData = new FormData();
    formData.append('searchTerm', searchTerm);
    formData.append('searchType', searchType);

    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    return response.json();
  },

  // Get latest recipes
  getLatestRecipes: async () => {
    const response = await fetchWithCredentials(`${API_BASE_URL}/explore-latest`);
    return response.json();
  },

  // Get random recipe
  getRandomRecipe: async () => {
    const response = await fetchWithCredentials(`${API_BASE_URL}/explore-random`);
    return response.json();
  },
};

// User API
export const userApi = {
  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await fetchWithCredentials(`${API_BASE_URL}/api/user/current`);
      return response.json();
    } catch {
      return null;
    }
  },

  // Login
  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });

    return response;
  },

  // Signup
  signup: async (name: string, email: string, password: string) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    return response;
  },

  // Logout
  logout: async () => {
    const response = await fetchWithCredentials(`${API_BASE_URL}/logout`, {
      method: 'GET',
    });
    return response;
  },

  // Update profile
  updateProfile: async (name: string, email: string) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);

    const response = await fetch(`${API_BASE_URL}/edit-profile`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    return response;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    const formData = new FormData();
    formData.append('currentPassword', currentPassword);
    formData.append('newPassword', newPassword);
    formData.append('confirmPassword', confirmPassword);

    const response = await fetch(`${API_BASE_URL}/change-password`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    return response;
  },
};

// Image API
export const imageApi = {
  // Get image URL
  getImageUrl: (filename: string) => {
    return `${API_BASE_URL}/image/${filename}`;
  },
};
