let express = require("express");
let app = express();
let reloadMagic = require("./reload-magic.js");
const multer = require("multer");
const upload = multer();
const cookieparser = require("cookie-parser");
app.use(cookieparser());
let http = require("http").createServer(app);
let io = require("socket.io")(http);
let MongoClient = require("mongodb").MongoClient;
let ObjectId = require("mongodb").ObjectID;
let dbo;
let url =
  "mongodb+srv://bob:bobsue@decodecluster-dssfv.mongodb.net/test?retryWrites=true&w=majority";
MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
  dbo = db.db("VideoChat");
});
reloadMagic(app);
let attemptingToCall = {};
app.use("/", express.static("build"));
app.use("/", express.static("public"));

app.post("/signup", upload.none(), (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  dbo.collection("users").findOne({ username: username }, (err, user) => {
    if (err) {
      console.log("error finding username");
      res.send(
        JSON.stringify({ success: false, type: "error finding username" })
      );
      return;
    }
    if (user !== null) {
      console.log("user exists");
      res.send(JSON.stringify({ success: false, type: "user exists" }));
      return;
    } else {
      dbo.collection("users").insertOne({ username, password });
      res.send(JSON.stringify({ success: true, name: username }));
      return;
    }
  });
});

app.post("/login", upload.none(), (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  dbo.collection("users").findOne({ username: username }, (err, user) => {
    if (err) {
      console.log("Login error");
      res.send(JSON.stringify({ success: false, type: "error" }));
      return;
    }
    if (user === null) {
      console.log("User does not exist");
      res.send(JSON.stringify({ success: false, type: "NoUser" }));
      return;
    }
    if (password !== user.password) {
      console.log("wrong password");
      res.send(JSON.stringify({ success: false, type: "Incorrect Password" }));
    }
    if (password === user.password) {
      console.log("successful login", user);
      res.send(JSON.stringify({ success: true, name: username }));
      return;
    }
  });
});

app.post("/allUsers", upload.none(), (req, res) => {
  let username = req.body.username;
  dbo
    .collection("users")
    .find({})
    .toArray((err, users) => {
      if (err) {
        console.log("error finding users");
        res.send(JSON.stringify({ success: false }));
      } else {
        users = users.filter(user => {
          return user.username !== username;
        });
        users = users.map(user => {
          return user.username;
        });
        res.send(JSON.stringify({ success: true, users }));
      }
    });
});

io.on("connection", socket => {
  socket.on("message", (message, room) => {
    console.log(message, "sent to", room);
    io.to(room).emit("message", message);
  });
  socket.on("create or join", room => {
    console.log("in create or join");
    let clientsInRoom = io.sockets.adapter.rooms[room];
    let numClients = clientsInRoom ? Object.keys(clientsInRoom).length : 0;

    if (numClients === 0) {
      console.log("should be 0 clients", numClients);
      socket.join(room);
      console.log("creating room", room);
      socket.emit("created", room, socket.id);
    } else if (numClients === 2) {
      console.log("should be 1 client", numClients);
      io.sockets.in(room).emit("join");
      socket.join(room);
      socket.emit("joined", room, socket.id);
      io.sockets.in(room).emit("ready");
    } else {
      console.log("room is full", numClients);
      socket.emit("full", room);
    }
  });
  socket.on("bye", () => {
    console.log("a user hung up");
  });
});

app.all("/*", (req, res, next) => {
  res.sendFile(__dirname + "/build/index.html");
});

http.listen(4000, "0.0.0.0", () => {
  console.log("Server running on port 4000");
});
