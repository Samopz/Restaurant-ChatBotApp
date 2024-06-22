const mongoose = require("mongoose");

// Define a schema for menu items
const MenuItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
});

// Create a model from the schema
const menuItem = mongoose.model("MenuItem", MenuItemSchema);

// Create some menu items if they don't already exist
const menuItems = [
  { name: "Pizza", price: 9.99, description: "Delicious cheese pizza" },
  { name: "Burger", price: 7.99, description: "Juicy beef burger" },
  { name: "Fries", price: 2.99, description: "Crispy golden fries" },
  { name: " Bread", price: 2.99, description: "Fresh golden Bread" },
  { name: "Beans", price: 2.99, description: "Fresh Beans" },
  { name: "Friedrice", price: 4.99, description: "Fresh foreign Friedrice" },
  // Add more items as needed...
];

menuItems.forEach((item) => {
  menuItem
    .findOne(item)
    .then((foundItem) => {
      if (!foundItem) {
        menuItem
          .create(item)
          .then((createdItem) => console.log("Created:", createdItem))
          .catch((err) => console.error(err));
      }
    })
    .catch((err) => console.error(err));
});

// Export the model
module.exports = menuItem;
