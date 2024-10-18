const express = require('express');
const UserModel = require('../Model/User');
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// const { authenticateToken, authorizeRole } = require("../authMiddleware");

// Register a new user
router.post('/register', async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new UserModel({ name, email, password: hashedPassword, role });
      await user.save();
      return res.status(201).send({ status: "success", data: "User Registered" });
    } catch (e) {
      return res.status(500).send({ status: "Faild", message: e.toString() });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email }).select('+password');
  
      if (!user) return res.status(400).send({ status: "Faild", message: "Email or password is wrong" });
  
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).send({ status: "Faild", message: "Invalid password" });
      const token = jwt.sign(
        { _id: user._id, role: user.role },
        process.env.JWT_SECRET || "your_jwt_secret"
      );
      // Configure the `token` HTTPOnly cookie
      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite:"none"
      };
  
      res.cookie("token", token, options);
      return res.status(200).send({
        status: "success",
        token: token,
      });
    } catch (e) {
      return res.status(500).send({ status: "Faild", message: e.toString() });
    }
  });
module.exports = router;

