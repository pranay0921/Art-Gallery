const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/authMiddleware');
const { uploadPost, getPosts, deletePost } = require('../controllers/postController');

const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

router.post('/', auth, upload.single('image'), uploadPost);
router.get('/', getPosts);
router.delete('/:id', auth, deletePost);

module.exports = router;
