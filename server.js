const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/foodstall", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

// =====================
//  User Schema & Model
// =====================
const UserSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" }
});

const User = mongoose.model("User", UserSchema);

// =====================
//  Food Item Schema & Model
// =====================
const FoodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ["veg", "non-veg", "fast-food", "appetizer", "main-course", "dessert", "beverage", "snacks", "soups", "salads", "breakfast", "lunch", "dinner"], 
    required: true 
  },
  image: { type: String, default: "" },
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const FoodItem = mongoose.model("FoodItem", FoodItemSchema);

// =====================
//  Order Schema & Model
// =====================
const OrderItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const CustomerSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  items: { type: [OrderItemSchema], required: true },
  customer: { type: CustomerSchema, required: true },
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["online", "card", "cod"], required: true },
  status: { type: String, enum: ["pending", "paid", "failed", "cancelled"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", OrderSchema);

// =====================
//  Register (Signup)
// =====================
app.post("/api/auth/register", async (req, res) => {
  try {
    const { fname, lname, email, phone, password, role } = req.body;

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const newUser = new User({
      fname,
      lname,
      email,
      phone,
      password: hashedPassword,
      role: role || "user" // default is user
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("❌ Error registering user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
//  Login
// =====================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // return user role
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        fname: user.fname,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("❌ Error logging in:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
//  Food Items API
// =====================

// Get all food items
app.get("/api/food-items", async (req, res) => {
  try {
    const items = await FoodItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("❌ Error fetching food items:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single food item
app.get("/api/food-items/:id", async (req, res) => {
  try {
    const item = await FoodItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Food item not found" });
    }
    res.json(item);
  } catch (err) {
    console.error("❌ Error fetching food item:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new food item
app.post("/api/food-items", async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;
    
    const newItem = new FoodItem({
      name,
      description,
      price,
      category,
      image,
      stock: stock || 0
    });
    
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error("❌ Error creating food item:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update food item
app.put("/api/food-items/:id", async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;
    
    const updatedItem = await FoodItem.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        category,
        image,
        stock,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ message: "Food item not found" });
    }
    
    res.json(updatedItem);
  } catch (err) {
    console.error("❌ Error updating food item:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete food item
app.delete("/api/food-items/:id", async (req, res) => {
  try {
    const deletedItem = await FoodItem.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ message: "Food item not found" });
    }
    
    res.json({ message: "Food item deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting food item:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
//  Orders API
// =====================

// Create order
app.post("/api/orders", async (req, res) => {
  try {
    const { items, customer, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }
    if (!customer || !paymentMethod) {
      return res.status(400).json({ message: "Customer details and payment method are required" });
    }

    // Validate and fetch current stock/prices
    const itemIds = items.map(i => i.itemId);
    const dbItems = await FoodItem.find({ _id: { $in: itemIds } });

    const idToDbItem = new Map(dbItems.map(doc => [String(doc._id), doc]));

    for (const cartItem of items) {
      const dbItem = idToDbItem.get(String(cartItem.itemId));
      if (!dbItem) {
        return res.status(400).json({ message: `Item not found: ${cartItem.itemId}` });
      }
      if (dbItem.stock < cartItem.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${dbItem.name}` });
      }
    }

    // Calculate totals based on DB prices to prevent tampering
    const orderItems = items.map(ci => {
      const dbItem = idToDbItem.get(String(ci.itemId));
      return {
        itemId: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        quantity: ci.quantity
      };
    });

    const subtotal = orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% tax
    const total = Math.round((subtotal + tax) * 100) / 100;

    // Decrement stock atomically (best-effort sequential for simplicity)
    for (const it of orderItems) {
      const updated = await FoodItem.findOneAndUpdate(
        { _id: it.itemId, stock: { $gte: it.quantity } },
        { $inc: { stock: -it.quantity }, $set: { updatedAt: Date.now() } },
        { new: true }
      );
      if (!updated) {
        return res.status(409).json({ message: `Stock changed for ${it.name}. Try again.` });
      }
    }

    const orderDoc = new Order({
      items: orderItems,
      customer,
      subtotal,
      tax,
      total,
      paymentMethod,
      status: paymentMethod === "online" ? "pending" : "pending"
    });

    await orderDoc.save();

    // For this demo, we won't integrate payment gateway. Return order summary
    res.status(201).json(orderDoc);
  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get orders (optionally filter by email)
app.get("/api/orders", async (req, res) => {
  try {
    const { email } = req.query;
    const filter = email ? { "customer.email": email } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get order by id
app.get("/api/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    console.error("❌ Error fetching order:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
//  Stock Management API
// =====================

// Get stock items (same as food items but focused on stock)
app.get("/api/stock", async (req, res) => {
  try {
    const items = await FoodItem.find().select('name category image stock updatedAt').sort({ name: 1 });
    res.json(items);
  } catch (err) {
    console.error("❌ Error fetching stock items:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update stock quantity
app.put("/api/stock/:id", async (req, res) => {
  try {
    const { stock } = req.body;
    
    const updatedItem = await FoodItem.findByIdAndUpdate(
      req.params.id,
      { stock, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ message: "Food item not found" });
    }
    
    res.json(updatedItem);
  } catch (err) {
    console.error("❌ Error updating stock:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================
//  Start server
// =====================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
