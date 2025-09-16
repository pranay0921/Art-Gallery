// Common JS used by all pages
// Make sure backend is running on this URL
const BASE_URL = 'http://localhost:5000';

// Simple JWT parse (no verification) to get payload
function parseJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
}

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function clearAuth() {
  localStorage.removeItem('token');
}

// Add nav links dynamically
function renderHeader() {
  const headerEl = document.getElementById('app-header');
  if (!headerEl) return;
  const token = getToken();
  const username = token ? (parseJwt(token)?.username || '') : '';
  headerEl.innerHTML = `
    <div class="logo">InstaClone</div>
    <div class="nav-links">
      ${token ? `
        <a href="feed.html">Feed</a>
        <a href="upload.html">Upload</a>
        <a href="profile.html">Profile</a>
        <button class="logout" id="logoutBtn">Logout</button>
      ` : `
        <a href="index.html">Login</a>
      `}
    </div>
  `;
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearAuth();
      window.location.href = 'index.html';
    });
  }
}

/* ===== AUTH: register & login (index.html) ===== */
async function registerUser(username, password) {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  } catch (err) {
    return { error: err.message };
  }
}

async function loginUser(username, password) {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    // If backend returns token only, attach username into token payload via a temporary approach:
    // If token exists, we will keep username in localStorage for convenience
    if (data.token) {
      // store token; also store username in localStorage for UI convenience
      setToken(data.token);
      localStorage.setItem('username', username);
    }
    return data;
  } catch (err) {
    return { error: err.message };
  }
}

/* ===== POSTS: fetch, upload, delete ===== */
async function fetchPosts() {
  const res = await fetch(`${BASE_URL}/api/posts`);
  return res.json();
}

function renderFeed(posts, targetEl) {
  if (!targetEl) return;
  targetEl.innerHTML = '';
  if (!posts || posts.length === 0) {
    targetEl.innerHTML = `<div class="card center">No posts yet.</div>`;
    return;
  }
  posts.forEach(p => {
    const post = document.createElement('div');
    post.className = 'post';
    const imgUrl = `${BASE_URL}/uploads/${p.image}`;
    post.innerHTML = `
      <div class="meta">
        <div><strong>${p.username}</strong></div>
        <div class="small">${new Date(p.created_at).toLocaleString ? new Date(p.created_at).toLocaleString() : ''}</div>
      </div>
      <img src="${imgUrl}" alt="post image" onerror="this.style.display='none'">
      <div class="caption">${escapeHtml(p.caption || '')}</div>
    `;
    targetEl.appendChild(post);
  });
}

async function uploadPost(formEl) {
  const token = getToken();
  if (!token) return { error: 'Not authenticated' };
  const fd = new FormData(formEl);
  try {
    const res = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: fd
    });
    return res.json();
  } catch (err) {
    return { error: err.message };
  }
}

async function deletePost(postId) {
  const token = getToken();
  if (!token) return { error: 'Not authenticated' };
  try {
    const res = await fetch(`${BASE_URL}/api/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  } catch (err) {
    return { error: err.message };
  }
}

/* ===== PROFILE: show user's posts & delete ===== */
function renderProfile(posts, container) {
  container.innerHTML = '';
  if (!posts || posts.length === 0) {
    container.innerHTML = `<div class="card center">You have no posts yet.</div>`;
    return;
  }
  // grid of images and delete buttons
  const grid = document.createElement('div');
  grid.className = 'grid';
  posts.forEach(p => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div style="position:relative;">
        <img src="${BASE_URL}/uploads/${p.image}" alt="post" />
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div class="small">${escapeHtml(p.caption || '')}</div>
        <button class="delete-btn" data-id="${p.id}">Delete</button>
      </div>
    `;
    grid.appendChild(wrapper);
  });
  container.appendChild(grid);

  // attach delete handlers
  grid.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (!confirm('Delete this post?')) return;
      const result = await deletePost(id);
      if (result.msg) {
        alert(result.msg);
        // refresh profile
        loadProfile();
      } else {
        alert(result.error || 'Delete failed');
      }
    });
  });
}

/* ===== small helpers ===== */
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>"']/g, function (m) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m];
  });
}

/* ===== page-specific loaders (to be called from each page) ===== */
async function loadFeedPage() {
  renderHeader();
  const posts = await fetchPosts();
  const feedContainer = document.getElementById('feedContainer');
  renderFeed(posts, feedContainer);
}

async function loadProfile() {
  renderHeader();
  const token = getToken();
  if (!token) {
    window.location.href = 'index.html';
    return;
  }
  const payload = parseJwt(token);
  const userId = payload?.id;
  const username = localStorage.getItem('username') || payload?.username;
  document.getElementById('profileName').textContent = username || 'Profile';

  const posts = await fetchPosts();
  // filter posts belonging to logged-in user
  const myPosts = (posts || []).filter(p => Number(p.user_id) === Number(userId));
  renderProfile(myPosts, document.getElementById('profileContainer'));
}

function initUploadPage() {
  renderHeader();
  const form = document.getElementById('uploadForm');
  const msg = document.getElementById('uploadMsg');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = 'Uploading...';
    const result = await uploadPost(form);
    if (result.msg) {
      msg.textContent = result.msg;
      form.reset();
    } else {
      msg.textContent = result.error || 'Upload failed';
    }
  });
}

/* ===== GALLERY: artwork loading and filtering ===== */
const app = {
  artworks: [], // Will store artwork data

  async init() {
    await this.loadArtworks();
    this.renderArtworks();
    this.setupFilterListeners();
  },

  async loadArtworks() {
    // TODO: Replace with actual API call
    this.artworks = [
      { id: 1, title: 'Sample Artwork', category: 'painting', image: 'sample.jpg' },
      // Add more sample artworks
    ];
  },

  renderArtworks(category = 'all') {
    const grid = document.getElementById('artworkGrid');
    grid.innerHTML = '';

    const filteredArtworks = category === 'all' 
      ? this.artworks 
      : this.artworks.filter(art => art.category === category);

    filteredArtworks.forEach(artwork => {
      const artworkEl = document.createElement('div');
      artworkEl.className = 'artwork-item';
      artworkEl.innerHTML = `
        <img src="${artwork.image}" alt="${artwork.title}">
        <button class="share-btn">Share</button>
      `;
      grid.appendChild(artworkEl);
    });
  },

  setupFilterListeners() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        this.renderArtworks(btn.dataset.category);
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());

/* Export to window for pages to call */
window.app = {
  renderHeader,
  registerUser,
  loginUser,
  loadFeedPage,
  initUploadPage,
  loadProfile,
};
