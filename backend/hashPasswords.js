const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: String,
    email: String,
    password: String,
  })
);

async function run() {
  await mongoose.connect("mongodb://localhost:27017/yourdbname");

  const users = await User.find();

  for (let u of users) {
    if (u.password.startsWith("$2")) {
      console.log(`Skipping ${u.email} (already hashed)`);
      continue;
    }

    const hashed = await bcrypt.hash(u.password, 10);
    u.password = hashed;
    await u.save();

    console.log(`Hashed password for ${u.email}`);
  }

  console.log("All passwords converted!");
  process.exit();
}

run();
