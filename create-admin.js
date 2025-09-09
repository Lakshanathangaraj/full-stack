const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/foodstall", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" }
});

const User = mongoose.model("User", UserSchema);

// Create admin user
async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@foodstall.com" });
    if (existingAdmin) {
      console.log("❌ Admin user already exists");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create admin user
    const admin = new User({
      fname: "Admin",
      lname: "User",
      email: "admin@foodstall.com",
      phone: "1234567890",
      password: hashedPassword,
      role: "admin"
    });

    await admin.save();
    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@foodstall.com");
    console.log("🔑 Password: admin123");
    console.log("👤 Role: admin");
    
  } catch (err) {
    console.error("❌ Error creating admin:", err);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
