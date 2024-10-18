const express = require("express");
const mongoose = require("mongoose");
const SSLCommerzPayment = require("sslcommerz-lts");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const mongoURI = process.env.MONGO_URI;

const app = express();
const PORT = 3030;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // To handle form data sent by SSLCommerz

// MongoDB connection
const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Middleware for CORS and JSON parsing
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

// SSLCommerz configuration
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = false; // true for live mode, false for sandbox

const run = async () => {
  try {
    // Connect to the database
    await client.connect();

    // Collection for saving orders
    const ordersCollection = client.db("test").collection("orders");

    // POST request for creating a payment
    app.post("/Order", async (req, res) => {
      // Plan details sent from client side
      const planDetails = req.body;

      // Convert price into an integer
      const price = parseInt(planDetails.price);

      // Create a transaction ID using ObjectId
      const tran_id = new ObjectId().toString();

      // Payment data to send to SSLCommerz
      const data = {
        total_amount: price,
        currency: "BDT",
        tran_id: tran_id,
        success_url: `${process.env.SERVER_API}/payment/success`,
        fail_url: `${process.env.SERVER_API}/payment/fail`,
        cancel_url: `${process.env.SERVER_API}/payment/cancel`,
        ipn_url: `${process.env.SERVER_API}/payment/ipn`,
        shipping_method: "Courier",
        product_name: planDetails.plan,
        product_category: "Electronic",
        product_profile: "general",
        cus_name: "Customer Name",
        cus_email: planDetails.user_email,
        cus_add1: "Dhaka",
        cus_add2: "Dhaka",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: "01711111111",
        cus_fax: "01711111111",
        ship_name: "Customer Name",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };

      // Initialize SSLCommerz payment
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      sslcz.init(data).then((apiResponse) => {
        // Get the payment gateway URL
        let GatewayPageURL = apiResponse.GatewayPageURL;
        res.send({ url: GatewayPageURL });

        // Insert order details into the database
        const order = { ...planDetails, tran_id, status: "pending" };
        const result = ordersCollection.insertOne(order);
      });

      // POST request for handling successful payment
      app.post("/payment/success", async (req, res) => {
        // Update order status in the database to successful
        const result = await ordersCollection.updateOne(
          { tran_id },
          { $set: { status: "success" } }
        );
        //redirect to payment success page in client
        res.redirect("http://localhost:5173/payment/success");
      });

      // POST request for handling failed payment
      app.post("/payment/fail", async (req, res) => {
        // Update order status in the database to failed
        const result = await ordersCollection.updateOne(
          { tran_id },
          { $set: { status: "failed" } }
        );
        //redirect to payment failed page in client
        res.redirect("http://localhost:5173/payment/fail");
      });

      // POST request for handling canceled payment
      app.post("/payment/cancel", async (req, res) => {
        // Update order status in the database to canceled
        const result = await ordersCollection.updateOne(
          { tran_id },
          { $set: { status: "canceled" } }
        );
        //redirect to payment cancel page in client
        res.redirect("http://localhost:5173/payment/cancel");
      });

      // POST request for handling IPN (Instant Payment Notification)
      app.post("/payment/ipn", async (req, res) => {
        // Update order status in the database based on IPN notification
        const result = await ordersCollection.updateOne(
          { tran_id },
          { $set: { status: status === "VALID" } }
        );
        res.send({ message: "IPN received" });
      });
    });
  } finally {
    // Ensuring the server keeps running
  }
};

// Run the server
run().catch(console.dir);

// Simple route to check if server is running
app.get("/", async (req, res) => {
  res.send({ server_status: "Running" });
});

// Routes
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const orderRoutes = require("./routes/orders");

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
