const socket = io.connect();
//"ws://localhost:5500"

let theUUID;
let peerConnection;
let localStream;
let otherUser;
let peerID;
let otherPeerID;

const myPeer = new Peer();

myPeer.on("open", (id) => {
  peerID = id;
});

socket.on("connect", () => {
  const constraints = {
    video: true,
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
  otherUser = id; //handshake
});
function connectToNewUser(pid, stream) {
  const call = myPeer.call(pid, stream);
  call.on("stream", (theStream) => {
    document.getElementById("remote-video").srcObject = theStream;
  });
}

socket.on("server message", (msg) => {
  console.log(msg);
});

socket.on("other user", (ou) => {
  console.log("you joined: " + ou);
  otherUser = ou;
});
socket.on("other peer", (pid) => {
  //joiner
  console.log("pid " + pid);
  otherPeerID = pid;
});
