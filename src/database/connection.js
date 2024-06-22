const mongoose = require("mongoose");
const dotenv = require("dotenv");
const menuItem = require("../modelSchema/menuItem.js"); // Import the MenuItem model


dotenv.config();

const connect = async (url) => {
  mongoose.connect(url || process.env.MONGODB_URL),
    mongoose.connection.on("connected", () => {
      console.log("Connected to MongoDB Successfully");
    });

  mongoose.connection.on("error", (err) => {
    console.log("An error occurred while connecting to MongoDB");
    console.log(err);
  });
};


module.exports = {
  connect,
};

// Define a schema
// const OrderSchema = new mongoose.Schema({
//   items: [String],
//   date: { type: Date, default: Date.now },
// });

// // Create a model
// const Order = mongoose.model("Order", OrderSchema);

// // Create a new order
// const order = new Order({
//   items: ["Pizza", "Burger"],
// });

// Save the order to the database
// order.save((err, order) => {
//     if (err) return console.error(err);
//     console.log("Order saved:", order);
// });

// Retrieve all orders
// Order.find((err, orders) => {
//   if (err) return console.error(err);
//   console.log("Orders:", orders);
// });

// module.exports = mongoose;
