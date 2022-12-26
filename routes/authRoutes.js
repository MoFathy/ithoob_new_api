const express = require('express');
const { createUser, loginUser, getAllUsers, getUser, deleteUser, updateUser, handleRefreshToken, logout } = require('../controllers/userController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post("/register",createUser);
router.post("/login", loginUser);
router.get('/user/:id',authMiddleware, getUser);
router.put('/user/:id',authMiddleware, updateUser);
router.get('/users',authMiddleware,isAdmin, getAllUsers);
router.delete('/user/:id',authMiddleware,isAdmin, deleteUser);
router.get('/refreshToken', handleRefreshToken);
router.get('/logout', logout);


module.exports = router;