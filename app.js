const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { join } = require("node:path");
const io = require("socket.io")(http);
const ChatBot = require("./src/chatBot.js");
const db = require("./src/database/connection.js");
const menuItem = require("./src/modelSchema/menuItem.js");
const Order = require("./src/modelSchema/order.js");

require("dotenv").config();

// Middleware t0 parse JSON bodies
app.use(express.json());

const PORT = process.env.PORT;

// Connect to MongoDB
db.connect();

const bot = new ChatBot();

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

app.post('/message', async (req, res) => {
  const message = req.body.message;
  const response = await bot.processMessage(message);
  res.json({ response });
});

app.get("/menu", (req, res) => {
  // res.sendFile(join(__dirname, "index.html"));
  menuItem
    .find()

    .then((menuItems) => {
      res.json(menuItems);
    })
    .catch((err) => res.status(500).send("Error: " + err));
});

// POST endpoint to create a new menu item
app.post("/menuItems", (req, res) => {
  const newItem = new menuItem(req.body);

  newItem
    .save()
    .then((item) => res.status(201).json(item))
    .catch((err) => res.status(400).json("Error: " + err));
});

// PUT endpoint to update an existing menu item
app.put("/menuItems/:id", (req, res) => {
  menuItem
    .findById(req.params.id)
    .then((item) => {
      item.name = req.body.name;
      item.price = req.body.price;
      item.description = req.body.description;

      item
        .save()
        .then(() => res.json("Menu item updated!"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

// Fetch all ordered menu items
app.get("/orderedMenuItems", (req, res) => {
  Order.find()
    .populate("items.menuItemId", "name price description")
    .then((orders) => {
      let orderedMenuItems = [];
      orders.forEach((order) => {
        order.items.forEach((item) => {
          orderedMenuItems.push(item.menuItemId);
        });
      });
      res.json(orderedMenuItems);
    })
    .catch((err) => res.status(500).send("Error: " + err));
});

app.get("/orders/:id", (req, res) => {
  // Fetch a specific order using req.params.id
  Order.findById(req.params.id)
    .then((order) => {
      if (order) {
        res.json(order);
      } else {
        res.status(404).send("Order not found");
      }
    })
    .catch((err) => res.status(500).send("Error: " + err));
});

io.on("connection", (socket) => {
  // Send welcome message with options
  socket.emit(
    "message",
    "Welcome to Samopz' Restaurant!\n Please select an option:\na. Select 1 to Place an order.\nb. Select 99 to checkout order.\nc. Select 98 to see order history.\nd. Select 97 to see current order.\ne. Select 0 to cancel order."
  );

  // Process incoming messages
  socket.on("message", async (message) => {
    const response = await bot.processMessage(
      message,
      socket.handshake.sessionID
    );
    socket.emit("message", response);
  });
});

app.post("/message", async (req, res) => {
  const message = req.body.message;
  const response = await bot.processMessage(message);
  res.json({ response });
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
