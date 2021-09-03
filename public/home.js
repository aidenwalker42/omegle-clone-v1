let cameraActive = false;
let status = document.getElementById("status");
let theStream;
let errorMessage = document.getElementById("media-error");
function activateWebcam() {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.msGetUserMedia;
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
      theStream = stream;
      document.getElementById("webcam").srcObject = theStream;
      if (stream.active) {
        cameraActive = true;
        status.innerHTML = "Connected";
        status.className = "active";
        errorMessage.innerHTML = "";
      } else {
      }
    })
    .catch((e) => {
      console.log(e);
      status.innerHTML = "Media not connected";
      status.className = "error";
    });
}
function testMedia() {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.msGetUserMedia;
  const constraints = {
    video: true,
    audio: true,
  };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      theStream = stream;
      document.getElementById("webcam").srcObject = theStream;
      window.location = "https://omeegle.herokuapp.com/videochat.html";
    })
    .catch((e) => {
      console.log(e);
      status.innerHTML = "Media not connected";
      status.className = "error";
      errorMessage.innerHTML =
        "Media is not connected, please enable media permissions in your browser to access Video Chat";
    });
}
function textChat() {
  window.location = "https://aidens-omegle-chat.herokuapp.com/";
}
