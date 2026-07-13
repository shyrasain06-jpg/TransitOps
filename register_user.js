const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/transitops";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"] 
  }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function register() {
  const args = process.argv.slice(2);
  if (args.length < 4) {
    console.log("Usage: node register_user.js <Name> <Email> <Password> <Role>");
    console.log("\nAvailable Roles:");
    console.log(" - \"Fleet Manager\"");
    console.log(" - \"Dispatcher\"");
    console.log(" - \"Safety Officer\"");
    console.log(" - \"Financial Analyst\"");
    console.log('\nExample: node register_user.js "Jane Doe" "jane@transitops.com" "password123" "Dispatcher"');
    process.exit(0);
  }

  const [name, email, password, role] = args;

  const validRoles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];
  if (!validRoles.includes(role)) {
    console.error(`Error: Invalid role "${role}". Must be one of: ${validRoles.join(', ')}`);
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected.");

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      console.error(`Error: User with email "${email}" already exists.`);
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    console.log(`\nRegistration Successful!`);
    console.log(`------------------------`);
    console.log(`Name:  ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role:  ${user.role}`);
    console.log(`------------------------`);
  } catch (err) {
    console.error("Error registering user:", err.message);
  } finally {
    await mongoose.connection.close();
  }
}

register();
