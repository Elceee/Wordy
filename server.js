let { vowels, consonants } = require("./src/constants.js");

let express = require("express");
let app = express();
let reloadMagic = require("./reload-magic.js");
const multer = require("multer");
const upload = multer();
const cookieparser = require("cookie-parser");
app.use(cookieparser());
let http = require("http").createServer(app);
let io = require("socket.io")(http);
let fs = require("fs");
let wordListPath = require("word-list");
const wordArray = fs.readFileSync(wordListPath, "utf8").split("\n");
let MongoClient = require("mongodb").MongoClient;
let ObjectId = require("mongodb").ObjectID;
let dbo;
let url =
  "mongodb+srv://bob:bobsue@decodecluster-dssfv.mongodb.net/test?retryWrites=true&w=majority";
MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
  dbo = db.db("VideoChat");
});
// reloadMagic(app);
const accountSid = "AC2516e12d623defbaf2dc44b38ce81966";
const authToken = "831f8264a89848d11d554879e71e1aca";
const client = require("twilio")(accountSid, authToken);

app.use("/", express.static("build"));
app.use("/", express.static("public"));

app.get("/getServers", (req, res) => {
  client.tokens.create().then(token => res.send(JSON.stringify(token)));
});

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
  socket.on("gameStart", room => {
    socket.join(room);
    console.log("gameStart back end");
    io.in(room).emit("gameStart");
  });
  socket.on("newRound", room => {
    socket.join(room);
    console.log("in new round back end");
    let newLetters = [];
    let remainingLetters = 10;
    let vowelNumber = Math.round(Math.random() * 2) + 2;
    let consonantsNumber = remainingLetters - vowelNumber;
    for (let x = 0; x < vowelNumber; x++) {
      newLetters.push(vowels[Math.round(Math.random() * (vowels.length - 1))]);
    }
    for (let y = 0; y < consonantsNumber; y++) {
      newLetters.push(
        consonants[Math.round(Math.random() * (consonants.length - 1))]
      );
    }
    console.log("newletters", newLetters, room, typeof room);
    io.in(room).emit("newLetters", { newLetters });
  });
  socket.on("submittedWords", (room, submittedWords, username) => {
    let validWords = [];
    let points = 0
    let userWords = JSON.parse(submittedWords);
    room = JSON.parse(room);
    username = JSON.parse(username);
    userWords.forEach(word => {
      if (wordArray.includes(word)) {
        points += word.length
        validWords.push(word);
      }
    });
    io.in(room).emit("scoreUpdate", {words: validWords, score: points, username})
  });
});

app.all("/*", (req, res, next) => {
  res.sendFile(__dirname + "/build/index.html");
});

http.listen(process.env.PORT || 4000, "0.0.0.0", () => {
  console.log("Server running on port 4000");
});
