const db = require('../config/db');
const path = require('path');

exports.uploadPost = (req, res) => {
    const { caption } = req.body;
    const image = req.file.filename;
    db.query("INSERT INTO posts (user_id, caption, image) VALUES (?, ?, ?)", [req.user.id, caption, image], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ msg: "Post uploaded successfully" });
    });
};

exports.getPosts = (req, res) => {
    db.query("SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

exports.deletePost = (req, res) => {
    const postId = req.params.id;
    db.query("DELETE FROM posts WHERE id = ? AND user_id = ?", [postId, req.user.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ msg: "Post deleted" });
    });
};
