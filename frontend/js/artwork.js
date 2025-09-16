const artwork = {
  async loadArtworks(category = 'all') {
    try {
      const response = await fetch(`/api/artworks${category !== 'all' ? `?category=${category}` : ''}`);
      const artworks = await response.json();
      this.renderArtworks(artworks);
    } catch (err) {
      console.error('Error loading artworks:', err);
    }
  },

  renderArtworks(artworks) {
    const grid = document.getElementById('artworkGrid');
    const template = document.getElementById('artworkTemplate');
    grid.innerHTML = '';

    artworks.forEach(art => {
      const clone = template.content.cloneNode(true);
      const item = clone.querySelector('.artwork-item');
      
      item.querySelector('img').src = art.imageUrl;
      item.querySelector('.artwork-title').textContent = art.title;
      item.querySelector('.like-count').textContent = art.likes;
      
      if (auth.user) {
        this.setupInteractions(item, art.id);
      }
      
      grid.appendChild(clone);
    });
  },

  setupInteractions(itemEl, artworkId) {
    const likeBtn = itemEl.querySelector('.like-btn');
    const shareBtn = itemEl.querySelector('.share-btn');

    likeBtn.addEventListener('click', () => this.handleLike(artworkId));
    shareBtn.addEventListener('click', () => this.handleShare(artworkId));
  },

  async handleLike(artworkId) {
    if (!auth.token) return;
    try {
      const response = await fetch(`/api/artworks/${artworkId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (response.ok) {
        await this.loadArtworks(); // Refresh artwork display
      }
    } catch (err) {
      console.error('Error liking artwork:', err);
    }
  },

  handleShare(artworkId) {
    const url = `${window.location.origin}/artwork/${artworkId}`;
    navigator.clipboard.writeText(url)
      .then(() => alert('Link copied to clipboard!'))
      .catch(err => console.error('Error copying link:', err));
  }
};
