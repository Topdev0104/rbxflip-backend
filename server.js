const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const path = require("path");
const connectDB = require("./config/db");
require("dotenv").config();
const app = express();

// Connect Database
connectDB();

// Init Middleware
// app.use(cors());
app.use(
  cors({
    origin: ["https://www.section.io", "http://localhost:3000"],
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Passport middleware
app.use(passport.initialize());

// Serve static assets in productioncd
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// SOCKET
const http = require("http");
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);
const onlineUsers = {};
try {
  io.on("connection", (socket) => {
    // Get connected user id
    const userId = socket.handshake.query.userId;
    // Set user as online
    onlineUsers[userId] = socket.id;

    socket.on("user_logout", (item) => {
      socket.disconnect();
    });
    socket.on("disconnect", () => {
      let disconnectedUserId = null;
      // Remove disconnected user from online users
      for (prop in onlineUsers) {
        if (onlineUsers[prop] === socket.id) {
          disconnectedUserId = prop;
          delete onlineUsers[prop];
          break;
        }
      }
    });
  });
} catch (e) {}
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
