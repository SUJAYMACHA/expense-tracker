const express = require('express');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Protected route - requires JWT token
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        email: req.user.email,
        createdAt: req.user.createdAt
      }
    }
  });
});

module.exports = router;
