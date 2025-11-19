const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      ...options.headers,
    };

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      
      // Only clear token on actual auth errors, not on other API errors
      if (response.status === 401 && error.error?.includes('token')) {
        this.clearToken();
      }
      
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async register(email: string, password: string, fullName: string, roles?: string[]) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, roles }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  logout() {
    this.clearToken();
  }

  // Profiles
  async getMyProfile() {
    return this.request('/profiles/me');
  }

  async getProfile(id: string) {
    return this.request(`/profiles/${id}`);
  }

  async getWorkerProfile(id: string) {
    return this.request(`/profiles/${id}`);
  }

  async updateProfile(data: any) {
    return this.request('/profiles/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async addExperience(data: any) {
    return this.request('/profiles/experience', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addSkill(data: any) {
    return this.request('/profiles/skills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Jobs
  async getJobs(params?: { category?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/jobs${query ? `?${query}` : ''}`);
  }

  async getJob(id: string) {
    return this.request(`/jobs/${id}`);
  }

  async createJob(data: any) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateJob(id: string, data: any) {
    return this.request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteJob(id: string) {
    return this.request(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  // Applications
  async getMyApplications() {
    return this.request('/applications');
  }

  async getEmployerApplications() {
    return this.request('/applications/employer');
  }

  async getJobApplications(jobId: string) {
    return this.request(`/applications/job/${jobId}`);
  }

  async createApplication(jobId: string, message?: string) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId, message }),
    });
  }

  async updateApplication(id: string, status: string) {
    return this.request(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Courses
  async getCourses(params?: { category?: string; level?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/courses${query ? `?${query}` : ''}`);
  }

  async getMyCourses(params?: { category?: string; level?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/courses/my-courses${query ? `?${query}` : ''}`);
  }

  async getCourse(id: string) {
    return this.request(`/courses/${id}`);
  }

  async createCourse(data: any) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCourse(id: string, data: any) {
    return this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Admin APIs
  async getUsers() {
    return this.request('/admin/users');
  }

  async updateUser(id: string, data: any) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getPlatformStats() {
    return this.request('/admin/stats');
  }

  async getRecentActivity() {
    return this.request('/admin/activity');
  }

  async updateJobStatus(id: string, status: string) {
    return this.request(`/admin/jobs/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async enrollCourse(id: string) {
    return this.request(`/courses/${id}/enroll`, {
      method: 'POST',
    });
  }

  async getCourseProgress(id: string) {
    return this.request(`/courses/${id}/progress`);
  }

  async getMyEnrollments() {
    return this.request('/courses/enrollments/my');
  }

  // Wallet
  async getWallet() {
    return this.request('/wallets/me');
  }

  async createTransaction(data: any) {
    return this.request('/wallets/transaction', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notifications
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async createNotification(data: any) {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // File Upload APIs
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.request('/uploads/avatar', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary
        'Authorization': `Bearer ${this.token}`,
      },
    });
  }

  async uploadCourseMaterial(courseId: string, file: File, title?: string, description?: string) {
    const formData = new FormData();
    formData.append('material', file);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);
    
    return this.request(`/uploads/course/${courseId}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
  }

  async uploadJobAttachment(jobId: string, file: File, title?: string, description?: string) {
    const formData = new FormData();
    formData.append('attachment', file);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);
    
    return this.request(`/uploads/job/${jobId}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
  }

  async deleteFile(publicId: string, type: string, resourceId?: string) {
    const params = new URLSearchParams({ type });
    if (resourceId) params.append('resourceId', resourceId);
    
    return this.request(`/uploads/file/${publicId}?${params.toString()}`, {
      method: 'DELETE',
    });
  }

  async getMyFiles() {
    return this.request('/uploads/my-files');
  }

  // Email APIs
  async requestPasswordReset(email: string) {
    return this.request('/email/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/email/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async sendTestEmail(to: string, type: string = 'welcome') {
    return this.request('/email/test', {
      method: 'POST',
      body: JSON.stringify({ to, type }),
    });
  }

  // Ratings
  async getWorkerRatings(workerId: string) {
    return this.request(`/ratings/worker/${workerId}`);
  }

  async getMyRatings() {
    return this.request('/ratings/employer');
  }

  async createRating(data: any) {
    return this.request('/ratings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRating(id: string, data: any) {
    return this.request(`/ratings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRating(id: string) {
    return this.request(`/ratings/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
