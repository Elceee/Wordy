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
let nextRoom = {};
let sessions = {};
let chatMessages = {};
let switchBoard = {};
app.use("/", express.static("build"));
app.use("/", express.static("public"));

app.get("/getServers", (req, res) => {
  client.tokens.create().then(token => res.send(JSON.stringify(token)));
});

app.post("/signup", upload.none(), (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let sessionId = randomNumber();
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
      dbo
        .collection("users")
        .insertOne({ username, password, friends: [], pendingFriends: [] });
      sessions[sessionId] = username;
      res.cookie("sid", sessionId);
      res.send(JSON.stringify({ success: true, name: username }));
      return;
    }
  });
});

app.post("/login", upload.none(), (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let sessionId = randomNumber();
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
      sessions[sessionId] = username;
      res.cookie("sid", sessionId);
      res.send(JSON.stringify({ success: true, name: username }));
      return;
    }
  });
});

app.get("/logout", (req, res) => {
  let sid = req.cookies.sid;
  if (sessions[sid] !== undefined) {
    delete sessions[sid];
    res.send(JSON.stringify({ success: true }));
    return;
  }
  console.log("issue logging out", sessions[sid]);
  res.send(JSON.stringify({ success: false }));
});

app.get("/isUserLoggedIn", (req, res) => {
  let sid = req.cookies.sid;
  if (sessions[sid] !== undefined) {
    res.send(JSON.stringify({ success: true, username: sessions[sid] }));
  }
});

app.post("/isUserBeingCalled", upload.none(), (req, res) => {
  let username = req.body.username;
  if (Object.keys(switchBoard).includes(username)) {
    let responseObject = { success: true, caller: switchBoard[username] };
    res.send(JSON.stringify(responseObject));
    delete switchBoard[username];
    return;
  }
  res.send(JSON.stringify({ success: false }));
});

app.post("/callFriend", upload.none(), (req, res) => {
  let username = req.body.username;
  let friendName = req.body.friendName;
  if (switchBoard[friendName] === undefined) {
    switchBoard[friendName] = username;
    res.send(JSON.stringify({ success: true }));
    return;
  }
  res.send(JSON.stringify({ success: false }));
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

app.post("/getFriends", upload.none(), (req, res) => {
  let username = req.body.username;
  let sid = req.cookies.sid;
  if (username !== sessions[sid]) {
    console.log("front end username and cookies do not match");
    res.send(JSON.stringify({ success: false }));
    return;
  }
  dbo.collection("users").findOne({ username: username }, (err, user) => {
    if (err) {
      console.log("error finding friends for", username);
      res.send(JSON.stringify({ success: false }));
      return;
    } else {
      let friends = user.friends;
      let pendingFriends = user.pendingFriends;
      console.log("successfully got friends for", username);
      res.send(JSON.stringify({ success: true, friends, pendingFriends }));
      return;
    }
  });
});

app.post("/acceptFriend", upload.none(), (req, res) => {
  let friendName = req.body.friendName;
  let username = req.body.username;
  let sid = req.cookies.sid;
  let isError = false;
  if (username !== sessions[sid]) {
    res.send(JSON.stringify({ success: false }));
    return;
  }
  dbo.collection("users").findOne({ username: username }, (err, user) => {
    if (err) {
      console.log("error accepting friend request");
      res.send(JSON.stringify({ success: false }));
      isError = true;
      return;
    }
    let newFriends = user.friends;
    let newPendingFriends = user.pendingFriends;
    newFriends.push(friendName);
    newPendingFriends = newPendingFriends.filter(friend => {
      return friend.user !== friendName;
    });
    dbo
      .collection("users")
      .updateOne(
        { username: username },
        { $set: { friends: newFriends, pendingFriends: newPendingFriends } }
      );
  });
  dbo.collection("users").findOne({ username: friendName }, (err, user) => {
    if (err) {
      console.log("error accepting friend request");
      res.send(JSON.stringify({ success: false }));
      isError = true;
      return;
    }
    let newFriends = user.friends;
    let newPendingFriends = user.pendingFriends;
    newFriends.push(username);
    newPendingFriends = newPendingFriends.filter(friend => {
      return friend.user !== username;
    });
    dbo
      .collection("users")
      .updateOne(
        { username: friendName },
        { $set: { friends: newFriends, pendingFriends: newPendingFriends } }
      );
  });
  if (isError) return;
  res.send(JSON.stringify({ success: true }));
});

app.post("/rejectFriend", upload.none(), (req, res) => {
  let friendName = req.body.friendName;
  let username = req.body.username;
  let sid = req.cookies.sid;
  let isError = false;
  if (username !== sessions[sid]) {
    res.send(JSON.stringify({ success: false }));
    return;
  }
  dbo.collection("users").findOne({ username: username }, (err, user) => {
    if (err) {
      console.log("error rejecting friend request");
      res.send(JSON.stringify({ success: false }));
      isError = true;
      return;
    }
    let newPendingFriends = user.pendingFriends;
    newPendingFriends = newPendingFriends.filter(friend => {
      return friend.user !== friendName;
    });
    dbo
      .collection("users")
      .updateOne(
        { username: username },
        { $set: { pendingFriends: newPendingFriends } }
      );
  });
  dbo.collection("users").findOne({ username: friendName }, (err, user) => {
    if (err) {
      console.log("error rejecting friend request");
      res.send(JSON.stringify({ success: false }));
      isError = true;
      return;
    }
    let newPendingFriends = user.pendingFriends;
    newPendingFriends = newPendingFriends.filter(friend => {
      return friend.user !== username;
    });
    dbo
      .collection("users")
      .updateOne(
        { username: friendName },
        { $set: { pendingFriends: newPendingFriends } }
      );
  });
  if (isError) return;
  res.send(JSON.stringify({ success: true }));
});

app.post("/addFriend", upload.none(), (req, res) => {
  let username = req.body.username;
  let friendName = req.body.friend;
  let recieverObject = { user: username, receiver: true };
  let senderObject = { user: friendName, receiver: false };
  let isError = false;
  if (username === friendName) {
    res.send(
      JSON.stringify({
        success: false,
        type: "You should already be friends with yourself"
      })
    );
    return;
  }
  dbo.collection("users").findOne({ username: username }, (err, user) => {
    if (err) {
      console.log("error rejecting friend request");
      res.send(JSON.stringify({ success: false }));
      isError = true;
      return;
    }
    let newPendingFriends = user.pendingFriends;
    newPendingFriends.push(senderObject);
    dbo
      .collection("users")
      .updateOne(
        { username: username },
        { $set: { pendingFriends: newPendingFriends } }
      );
  });
  dbo.collection("users").findOne({ username: friendName }, (err, user) => {
    if (err) {
      console.log("error rejecting friend request");
      res.send(JSON.stringify({ success: false }));
      isError = true;
      return;
    }
    let newPendingFriends = user.pendingFriends;
    newPendingFriends.push(recieverObject);
    dbo
      .collection("users")
      .updateOne(
        { username: friendName },
        { $set: { pendingFriends: newPendingFriends } }
      );
  });
  if (isError) {
    res.send(JSON.stringify({ success: false }));
    return;
  }
  res.send(JSON.stringify({ success: true }));
});

app.post("/removeFriend", upload.none(), (req, res) => {
  let sid = req.cookies.sid;
  let username = sessions[sid];
  let removedFriend = req.body.removedFriend;
  if (username === undefined) {
    return;
  }
  let isError = false;
  dbo.collection("users").findOne({ username: username }, (err, user) => {
    if (err) {
      console.log("error deleting friend");
      res.send(JSON.stringify({ success: false }));
      isError = true;
      return;
    } else {
      let friendsList = user.friends;
      friendsList = friendsList.filter(friend => {
        return friend !== removedFriend;
      });
      dbo
        .collection("users")
        .updateOne({ username: username }, { $set: { friends: friendsList } });
    }
  });
  dbo.collection("users").findOne({ username: removedFriend }, (err, user) => {
    if (err) {
      console.log("error deleting friend");
      res.send(JSON.stringify({ success: false }));
      isError = true;
      return;
    } else {
      let friendsList = user.friends;
      friendsList = friendsList.filter(friend => {
        return friend !== username;
      });
      dbo
        .collection("users")
        .updateOne(
          { username: removedFriend },
          { $set: { friends: friendsList } }
        );
    }
  });
  if (isError) return;

  res.send(JSON.stringify({ success: true }));
});

app.get("/joinRandomGame", (req, res) => {
  let destination;
  console.log(nextRoom["room"], "before");
  if (nextRoom["room"] === undefined) {
    destination = randomNumber();
    nextRoom["room"] = destination;
  } else if (nextRoom["room"] !== undefined) {
    destination = nextRoom["room"];
    delete nextRoom["room"];
  }
  console.log(nextRoom["room"], "after");
  res.send(JSON.stringify(destination));
});

io.on("connection", socket => {
  socket.on("message", (message, room) => {
    console.log(message, "sent to", room);
    io.to(room).emit("message", message);
  });
  socket.on("create or join", room => {
    console.log("in create or join");
    let clientsInRoom = io.sockets.adapter.rooms[room];
    let numClients = clientsInRoom
      ? Object.keys(clientsInRoom.sockets).length
      : 0;

    if (numClients === 0) {
      console.log(
        "should be 0 clients",
        numClients,
        io.sockets.adapter.rooms[room]
      );
      socket.join(room);
      console.log("creating room", room);
      socket.emit("created", room, socket.id);
    } else if (numClients === 1) {
      console.log(
        "should be 1 client",
        numClients,
        io.sockets.adapter.rooms[room]
      );
      io.sockets.in(room).emit("join");
      socket.join(room);
      socket.emit("joined", room, socket.id);
      io.sockets.in(room).emit("ready");
    } else {
      console.log("room is full", numClients);
      socket.emit("full", room);
    }
  });
  socket.on("bye", room => {
    socket.to(room).emit("message", "bye");
    socket.leave(room);
  });
  socket.on("gameStart", room => {
    socket.join(room);
    console.log("gameStart back end");
    io.in(room).emit("gameStart");
  });
  socket.on("newRound", room => {
    
    let clientsInRoom = io.sockets.adapter.rooms[room];
    console.log(io.sockets.adapter.rooms[room]);
    let numClients = clientsInRoom ? Object.keys(clientsInRoom).length : 0;
    console.log(numClients);
    if (numClients < 2) {
      socket.emit("error", {
        message: "Please wait till both players join the room to begin the game"
      });
      console.log("not enough players in room", numClients);
      return;
    }
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
    let points = 0;
    let userWords = JSON.parse(submittedWords);
    room = JSON.parse(room);
    username = JSON.parse(username);
    userWords.forEach(word => {
      if (wordArray.includes(word)) {
        points += word.length;
        validWords.push(word);
      }
    });
    io.in(room).emit("scoreUpdate", {
      words: validWords,
      score: points,
      username
    });
  });
  socket.on("joinChat", room => {
    socket.join(room);
    if (chatMessages[room] === undefined) {
      console.log("entered if statement");
      chatMessages[room] = [];
    }
    console.log("chatJoined", chatMessages[room]);
    socket.emit("newMessage", { messages: chatMessages[room] });
  });
  socket.on("sendMessage", (room, message, user) => {
    let newMessage = { message, user };
    let messages = chatMessages[room];
    messages = messages
      .reverse()
      .slice(0, 15)
      .reverse();
    messages.push(newMessage);
    chatMessages[room] = messages;
    io.in(room).emit("newMessage", { messages: chatMessages[room] });
  });
  socket.on("newWord", () => {
    let randomNumber = Math.round(Math.random() * (wordArray.length - 1));
    let word = wordArray[randomNumber];
    console.log("word of the day is", word);
    socket.emit("newWord", { word });
  });
});

let randomNumber = () => {
  return Math.round(Math.random() * 100000000000);
};

app.all("/*", (req, res, next) => {
  res.sendFile(__dirname + "/build/index.html");
});

http.listen(process.env.PORT || 4000, "0.0.0.0", () => {
  console.log("Server running on port 4000");
});
