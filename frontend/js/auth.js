const auth = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user')),

  async init() {
    this.updateUI();
    if (this.token) {
      await this.validateToken();
    }
  },

  updateUI() {
    const userSection = document.getElementById('userSection');
    if (this.user) {
      userSection.innerHTML = `
        <span>Welcome, ${this.user.username}</span>
        <button onclick="auth.logout()">Logout</button>
      `;
    } else {
      userSection.innerHTML = `
        <a href="pages/login.html">Login</a>
        <a href="pages/register.html">Register</a>
      `;
    }
  },

  async validateToken() {
    try {
      const response = await fetch('/api/auth/validate', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      if (!response.ok) {
        this.logout();
      }
    } catch (err) {
      this.logout();
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  }
};

document.addEventListener('DOMContentLoaded', () => auth.init());
