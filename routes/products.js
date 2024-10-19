const express = require('express');
const Product = require('../Model/Product');
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../authMiddleware");
// Get all products
router.get('/ReadAllProduct',authenticateToken,authorizeRole('viewPosts'), async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single product by ID
router.get('/ReadByProductID/:id',authenticateToken,authorizeRole('viewPosts'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Product not found');
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new product
router.post('/CreateProduct', async (req, res) => {
    const product = new Product({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
    });
    try {
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a product
router.post('/UpdateProductByID/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).send('Product not found');
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a product
router.post('/DeleteProductByID/:id',async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ message: 'Product deleted successfully', deletedProduct });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
