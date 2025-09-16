# Digital Art Gallery

A full-stack web application for artisans to showcase, share, and sell digital artwork.

## Objective
Build a platform where artisans can upload and manage their digital artwork (paintings, 3D art, anime, etc.), public users can browse artworks and artisan profiles, registered users can like and comment, and admins can moderate the platform.

## Key Features

### 🧑‍🎨 Artisan Features
- Register and log in securely (JWT authentication)
- Upload artwork (title, description, category, image)
- Manage (edit/delete) uploaded artworks
- View/delete/respond to comments on their artworks
- Profile page with gallery and artisan details

### 🌍 Public Users
- Browse all artworks in a public feed
- Filter artworks by category (Painting, 3D Art, Anime)
- View artisan profiles
- Express interest in purchasing artwork

### 💬 Registered Users
- Like artworks
- Comment on artworks (username, content, timestamp)
- Login/register (JWT authentication)

### 💼 Admin Panel
- Secure admin login
- Manage users and content
- Moderate comments and artworks

## Frontend
- HTML/CSS/JavaScript (Vanilla)
- Responsive grid gallery, hover effects, share button
- Navigation bar, homepage, profile, upload, categories
- Login/registration pages

## Backend
- Node.js + Express.js
- MySQL database
- JWT authentication
- Multer for image uploads

## API Endpoints (Sample)
- POST /api/register: Register user
- POST /api/login: Login
- GET /api/artworks: Fetch artworks
- POST /api/artworks: Upload artwork
- DELETE /api/artworks/:id: Delete artwork
- GET /api/artists: List artisans
- GET /api/artworks/me: Artisan's artworks
- POST /api/artworks/:id/comments: Add comment
- DELETE /api/artworks/:id/comments/:commentId: Delete comment

## Getting Started
1. Clone the repository
2. Install dependencies in backend and frontend folders
3. Set up MySQL database and .env files
4. Run backend and frontend servers

---
This project is a template for building a digital art marketplace with user interaction and admin moderation.