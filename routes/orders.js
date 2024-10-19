const express = require("express");
const router = express.Router();
const OrderModel = require("../Model/Order");
const { authenticateToken, authorizeRole } = require("../authMiddleware");
// Mock data
let orders = [];

// Create a new order
router.post("/CreateOrder",authenticateToken,authorizeRole('createOrder'), async (req, res) => {
  try {
    const newOrder = {
      id: orders.length + 1,
      userId: req.body.userId,
      products: req.body.products,
      total: req.body.total,
    };
    let order = await OrderModel.create(newOrder);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders
router.get("/:userID",authenticateToken,authorizeRole('readOrder'), async (req, res) => {
  try {
    let orders = await OrderModel.find({ userId: req.params.userID });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific order
router.get("/:ProductId",authenticateToken,authorizeRole('readOrder'), (req, res) => {
  try {
    const order = orders.find({ _id: req.params.ProductId });
    if (!order) return res.status(404).send("Order not found");
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
