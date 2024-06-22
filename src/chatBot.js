const { NlpManager } = require("node-nlp");
const express = require("express");
const session = require("express-session");
const axios = require("axios");

const app = express();

app.use(
  session({ secret: "your-secret", resave: false, saveUninitialized: true })
);

class ChatBot {
  constructor() {
    this.manager = new NlpManager({ languages: ["en"] });
    this.sessions = new Map();
    this.train();
  }

  async train() {
    this.manager.addDocument("en", "1", "order.select");
    this.manager.addDocument("en", "99", "order.checkout");
    this.manager.addDocument("en", "98", "order.history");
    this.manager.addDocument("en", "97", "order.current");
    this.manager.addDocument("en", "0", "order.cancel");
    this.manager.addDocument("en", "I want to order a meal", "order.meal");

    await this.manager.train();
  }

  async processMessage(message, sessionId) {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = { context: {}, order: [], history: [] };
      this.sessions.set(sessionId, session);
    }

    const response = await this.manager.process("en", message, session.context);
    session.context = response.context;
  // ...

  if (response.intent === "order.select") {
    let menu = "";
    try {
      const res = await axios.get("http://localhost:3000");
      if (Array.isArray(res.data)) {
        res.data.forEach((item, index) => {
          menu += `${index + 1}. ${item.name}\n`;
        });
      } else {
        console.error("Error: res.data is not an array");
        menu = "Error fetching menu";
      }
    } catch (err) {
      console.error(err);
      menu = "Error fetching menu";
    }
    return `Here is our menu: \n${menu}\nPlease select a meal by typing "I want to order a meal"`;
  }

    if (response.entities && response.entities.length > 0) {
      session.order.push(response.entities[0].value);
      return `You have added ${response.entities[0].value} to your order. You can continue ordering or type "99" to checkout.`;
    }

    if (response.intent === "order.meal") {
      session.order.push(response.entities[0].value);
      return `You have added ${response.entities[0].value} to your order. You can continue ordering or type "99" to checkout.`;
    }

    if (response.intent === "order.checkout") {
      if (session.order.length === 0) {
        return 'No order placed. You can place an order by typing "1".';
      } else {
        const order = session.order;
        session.order = [];
        session.history.push(order);
        return `Order placed for: ${order.join(
          ", "
        )}. You can place a new order by typing "1".`;
      }
    }

    if (response.intent === "order.history") {
      if (session.history.length === 0) {
        return 'No order history. You can place an order by typing "1".';
      } else {
        return `Your order history:\n${session.history
          .map((order, i) => `${i + 1}. ${order.join(", ")}`)
          .join("\n")}`;
      }
    }

    if (response.intent === "order.current") {
      if (session.order.length === 0) {
        return 'No current order. You can place an order by typing "1".';
      } else {
        return `Your current order is: ${session.order.join(
          ", "
        )}. You can continue ordering or type "99" to checkout.`;
      }
    }

    if (response.intent === "order.cancel") {
      if (session.order.length === 0) {
        return 'No order to cancel. You can place an order by typing "1".';
      } else {
        session.order = [];
        return 'Your order has been cancelled. You can place a new order by typing "1".';
      }
    }

    return response.answer;
  }
}


module.exports = ChatBot;
