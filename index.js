const express = require("express");
const mongoose = require("mongoose");
const OrderModel = require("./Model/Order");
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
// const client = new MongoClient(
//   "mongodb+srv://user8552:user8552@cluster0.derptwk.mongodb.net/EcommerceTo",
//   {
//     serverApi: {
//       version: ServerApiVersion.v1,
//       strict: true,
//       deprecationErrors: true,
//     },
//   }
// );

mongoose
  .connect(
    "mongodb+srv://user8552:user8552@cluster0.derptwk.mongodb.net/EcommerceTo"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
app.get("/", async (req, res) => {
  res.send("Root Server Is Running");
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
    // await client.connect();

    // POST request for creating a payment
    app.post("/Order", async (req, res) => {
      // Plan details sent from client side
      const tran_id = new ObjectId().toString();

      const planDetails = {
        userId: req.body.userId,
        price: req.body.price,
        total_order: req.body.total_order,
        product_name: req.body.product_name,
        cus_email: req.body.cus_email,
        status: "pending",
        tran_id: tran_id,
      };
      // Convert price into an integer
      const price = parseInt(planDetails.price);

      // Payment data to send to SSLCommerz
      const data = {
        total_amount: price,
        currency: "BDT",
        tran_id: tran_id,
        success_url: `${process.env.SERVER_API}/payment/success?tran_id=${tran_id}`,
        fail_url: `${process.env.SERVER_API}/payment/fail?tran_id=${tran_id}`,
        cancel_url: `${process.env.SERVER_API}/payment/cancel?tran_id=${tran_id}`,
        ipn_url: `${process.env.SERVER_API}/payment/ipn?tran_id=${tran_id}`,
        shipping_method: "Courier",
        product_name: planDetails.product_name,
        product_category: "Electronic",
        product_profile: "general",
        cus_name: "Customer Name",
        cus_email: planDetails.cus_email,
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
      // Collection for saving orders
      // const order = { ...planDetails, tran_id, status: "pending" };
      // const result = await OrderModel.create(order);
      // app.use("/CreateOrder",
      // const createInvoiceOrder = async (req, res) => {
      //   const newOrder = {
      //     userId: req.body.userId,
      //     price: req.body.price,
      //     total_order: req.body.total_order,
      //     product_name: req.body.products,
      //     cus_email: req.body.cus_email,
      //     status: "pending",
      //     tran_id: tran_id,
      //   };
      //   let order = await OrderModel.create(newOrder);
      //   res.status(201).json(order);
      // };
      // createInvoiceOrder(req, res);

      // // );
      // Initialize SSLCommerz payment
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      sslcz.init(data).then((apiResponse) => {
        // Get the payment gateway URL
        let GatewayPageURL = apiResponse.GatewayPageURL;
        // Insert order details into the database
        const order = new OrderModel({
          ...planDetails,
          tran_id,
          status: "pending",
        });
        const result = order.save();
        res.send({ url: GatewayPageURL, data: order });
      });

      // POST request for handling successful payment
      app.post("/payment/success", async (req, res) => {
        // Update order status in the database to successful
        const result = await OrderModel.updateOne(
          { tran_id },
          { $set: { status: "success" } }
        );
        //redirect to payment success page in client
        res.redirect("http://localhost:5173/payment/success");
      });

      // POST request for handling failed payment
      app.post("/payment/fail", async (req, res) => {
        // Update order status in the database to failed
        const result = await OrderModel.updateOne(
          { tran_id },
          { $set: { status: "failed" } }
        );
        //redirect to payment failed page in client
        res.redirect("http://localhost:5173/payment/fail");
      });

      // POST request for handling canceled payment
      app.post("/payment/cancel", async (req, res) => {
        // Update order status in the database to canceled
        const result = await OrderModel.updateOne(
          { tran_id },
          { $set: { status: "canceled" } }
        );
        //redirect to payment cancel page in client
        res.redirect("http://localhost:5173/payment/cancel");
      });

      // POST request for handling IPN (Instant Payment Notification)
      app.post("/payment", async (req, res) => {
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
