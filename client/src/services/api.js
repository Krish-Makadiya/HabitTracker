const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // If token is expired or invalid, remove it and redirect to login
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          // Force page reload to trigger auth check
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.reload();
          }
        }
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Auth methods
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  logout() {
    localStorage.removeItem('token');
  }

  // User methods
  async getUserProfile() {
    return this.request('/users/me');
  }

  async updateUserProfile(updates) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // Leaderboard methods
  async getLeaderboard() {
    return this.request('/users/leaderboard');
  }

  // Habit methods
  async getHabits() {
    return this.request('/habits');
  }

  async createHabit(habitData) {
    return this.request('/habits', {
      method: 'POST',
      body: JSON.stringify(habitData),
    });
  }

  async updateHabit(habitId, habitData) {
    return this.request(`/habits/${habitId}`, {
      method: 'PUT',
      body: JSON.stringify(habitData),
    });
  }

  async deleteHabit(habitId) {
    return this.request(`/habits/${habitId}`, {
      method: 'DELETE',
    });
  }

  async toggleHabitCompletion(habitId, date, notes = '') {
    return this.request(`/habits/${habitId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ 
        date: date.toISOString(),
        notes 
      }),
    });
  }

  async getHabitCompletions(habitId, startDate, endDate) {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    
    return this.request(`/habits/${habitId}/completions?${params}`);
  }

  async getAllCompletions(startDate, endDate) {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    
    return this.request(`/habits/completions/range?${params}`);
  }

  // Score methods
  async getDailyScores(startDate, endDate) {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    
    return this.request(`/habits/scores/range?${params}`);
  }

  async getScoreStats(startDate, endDate) {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    
    return this.request(`/habits/scores/stats?${params}`);
  }

  async recalculateScores(startDate, endDate) {
    return this.request('/habits/scores/recalculate', {
      method: 'POST',
      body: JSON.stringify({ 
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }),
    });
  }

  // User/Buddy methods
  async getBuddies() {
    return this.request('/users/buddies');
  }

  async getUserStats(userId) {
    return this.request(`/users/${userId}/stats`);
  }

  async getUserCalendar(userId, year, month) {
    return this.request(`/users/${userId}/calendar/${year}/${month}`);
  }
}

export default new ApiService();
