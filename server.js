const express = require("express");
const app = express();

app.use(express.static("public"));

const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: { origin: "*" },
});
const { v4: uuidV4 } = require("uuid");

const port = process.env.PORT || 5500;
server.listen(port, () => {
  console.log(port + " running");
});
//end of boilerplate server stuff

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

const rooms = {};
let oc = 0;

io.on("connection", (socket) => {
  console.log("+");
  oc++;
  io.emit("oc", oc);
  let roomID = uuidV4();
  let otherUser;
  socket.on("join room", (peerID, videoOn) => {
    console.log(otherUser);
    console.log(rooms[roomID] && rooms[roomID].includes(socket.id));
    if (rooms[roomID] && rooms[roomID].includes(socket.id)) {
      //if your room already has a person in it, delete room and get new uuid
      console.log("hello???");
      socket
        .to(rooms[roomID].find((id) => id !== socket.id))
        .emit("dc", "User has disconnected");
      console.log("DC WORK");
      console.log(otherUser);
      otherUser = "";
      delete rooms[roomID];
      roomID = uuidV4();
    }
    roomID = findEmptyRoom(roomID);
    if (rooms[roomID]) {
      //if the room exists
      rooms[roomID].push(socket.id); //add socket id to the room object
    } else {
      rooms[roomID] = [socket.id]; //create a room object with and array of socket ids
    }
    otherUser = rooms[roomID].find((id) => id !== socket.id);
    console.log(otherUser + " SET!!!");
    if (otherUser) {
      //if roomID doesnt have my id in it
      console.log("hit");
      console.log(otherUser);
      socket.emit("other user", otherUser, peerID, videoOn); //telling ourselves that there is another user
      socket.to(otherUser).emit("user joined", socket.id, peerID, videoOn); //telling them that you joined
    }
    socket.emit("uuid", roomID);
    console.log(rooms);
  });

  socket.on("send peerid", (id, peerID) => {
    socket.to(id).emit("other peer", peerID);
  });

  socket.on("message", (msg, servermsg) => {
    socket
      .to(rooms[roomID].find((id) => id !== socket.id))
      .emit("message", msg, servermsg);
  });

  socket.on("disconnect", () => {
    console.log("-");
    oc--;
    io.emit("oc", oc);
    console.log("OU + " + otherUser);
    try {
      otherUser = rooms[roomID].find((id) => id !== socket.id);
    } catch {
      console.log("riperror");
    }
    console.log("OU " + otherUser);
    socket.to(otherUser).emit("dc", "User has disconnected");
    delete rooms[roomID];
  });
});

function findEmptyRoom(room) {
  for (const [key, value] of Object.entries(rooms)) {
    console.log(`${key}: ${value}`);
    if (value.length === 1) {
      return key;
    }
  }
  return room;
}
