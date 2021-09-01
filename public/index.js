const socket = io.connect();
//"ws://localhost:5500"

let theUUID;
let peerConnection;
let localStream;
let otherUser;
let peerID;
let otherPeerID;

let form = document.getElementById("form");
let input = document.getElementById("input");
let theMessages = document.getElementById("messages");
let onlineCounter = document.querySelector("h3");

let joined = false;
let waitingOnConnection = false;

const myPeer = new Peer();

socket.on("oc", (oc) => {
  onlineCounter.innerHTML = "Users online: " + oc;
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value && joined) {
    //if not blank
    let msg = input.value;
    socket.emit("message", msg);
    let item = document.createElement("li");
    item.innerHTML = "<h4 id='you'>You: </h4>" + msg;
    messages.appendChild(item);
    input.value = ""; //clear
    theMessages.scrollTo(0, theMessages.scrollHeight);
  } else if (waitingOnConnection) {
    serverMsg("Waiting for stranger");
  } else if (!joined) {
    serverMsg('You havent joined a Room yet! Please click "New Room"');
  } else {
    serverMsg("You cannot send a blank message.");
  }
});

socket.on("message", function (msg) {
  strangerMsg(msg);
});

myPeer.on("open", (id) => {
  peerID = id;
});

socket.on("connect", () => {
  const constraints = {
    video: {
      width: {
        min: 480,
        max: 1280,
      },
      aspectRatio: 1.33333,
    },
    audio: true,
  };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      console.log("Got MediaStream:", stream);
      localStream = stream;
      document.getElementById("local-video").srcObject = localStream;
    })
    .catch((error) => {
      console.error("Error accessing media devices.", error);
    });
});

function joinRoom() {
  serverMsg("Searching for a stranger...");
  waitingOnConnection = true;
  joined = false;
  socket.emit("join room", peerID);
  document.getElementById("remote-video").srcObject = undefined;
  myPeer.on("call", (call) => {
    call.answer(localStream);

    call.on("stream", (theStream) => {
      document.getElementById("remote-video").srcObject = theStream;
    });
  });
}

socket.on("user joined", (id, pid) => {
  //host
  otherPeerID = pid;
  console.log("User connected: " + id + " " + pid);
  socket.emit("send peerid", id, peerID);
  connectToNewUser(pid, localStream);
  theMessages.innerHTML = "";
  joined = true;
  waitingOnConnection = false;
  serverMsg("Connected to a stranger, say hi!");
  otherUser = id; //handshake
});
function connectToNewUser(pid, stream) {
  const call = myPeer.call(pid, stream);
  call.on("stream", (theStream) => {
    document.getElementById("remote-video").srcObject = theStream;
  });
}
socket.on("other user", (ou) => {
  console.log("you joined: " + ou);
  theMessages.innerHTML = "";
  joined = true;
  waitingOnConnection = false;
  serverMsg("Connected to a stranger, say hi!");
  otherUser = ou;
});

socket.on("dc", (msg) => {
  console.log(msg);
  document.getElementById("remote-video").srcObject = undefined;
  joined = false;
  serverMsg('User has disconnected, click "New Room"');
});

socket.on("other peer", (pid) => {
  //joiner
  console.log("pid " + pid);
  otherPeerID = pid;
});

function serverMsg(msg) {
  let item = document.createElement("li");
  item.innerHTML = "<h4 id='server'>Server: </h4>" + msg;
  messages.appendChild(item);
  theMessages.scrollTo(0, theMessages.scrollHeight);
}

function strangerMsg(msg) {
  let item = document.createElement("li");
  item.innerHTML = "<h4>Stranger: </h4>" + msg;
  messages.appendChild(item);
  theMessages.scrollTo(0, theMessages.scrollHeight);
}
