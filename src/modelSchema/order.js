const mongoose = require("mongoose");

// Define a schema for orders
const OrderSchema = new mongoose.Schema({
  customerName: String,
  address: String,
  total: Number,
  items: [
    {
      menuItemId: mongoose.Schema.Types.ObjectId,
      quantity: Number,
    },
  ],
  orderDate: {
    type: Date,
    default: Date.now,
  },
});

// Create a model from the schema
const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
