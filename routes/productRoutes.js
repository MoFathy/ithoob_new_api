const express = require("express");
const router = express.Router();
const { createProduct, getProduct, getAllProducts, updateProduct, filteredProduct, deleteProduct } = require("../controllers/productController");
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");

router.post('/product',authMiddleware,isAdmin,createProduct);
router.get('/product/:slug',getProduct);
router.get('/product',getAllProducts);
router.put('/product/:slug',authMiddleware,isAdmin,updateProduct);
router.get('/product',filteredProduct);
router.delete('/product/:slug',authMiddleware,isAdmin, deleteProduct)

module.exports = router;