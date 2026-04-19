const video = document.getElementById("video");
const trackingStage = document.getElementById("tracking-stage");
let canvas;
let detectionInterval;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(
    "https://raw.githubusercontent.com/willtrinh/face-recognition/master/models/"
  ),
  faceapi.nets.faceLandmark68Net.loadFromUri(
    "https://raw.githubusercontent.com/willtrinh/face-recognition/master/models/"
  ),
  faceapi.nets.faceRecognitionNet.loadFromUri(
    "https://raw.githubusercontent.com/willtrinh/face-recognition/master/models/"
  ),
  faceapi.nets.faceExpressionNet.loadFromUri(
    "https://raw.githubusercontent.com/willtrinh/face-recognition/master/models/"
  ),
]).then(startVideo);

function startVideo() {
  const legacyGetUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

  const getUserMedia =
    navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      ? (constraints) => navigator.mediaDevices.getUserMedia(constraints)
      : legacyGetUserMedia
      ? (constraints) =>
          new Promise((resolve, reject) => {
            legacyGetUserMedia.call(navigator, constraints, resolve, reject);
          })
      : null;

  if (!getUserMedia) {
    console.error("Camera API is not supported in this browser.");
    return;
  }

  getUserMedia({ video: {} })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.error(error);
    });
}

video.addEventListener("play", () => {
  if (!canvas) {
    canvas = faceapi.createCanvasFromMedia(video);
    trackingStage.append(canvas);
  }

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  trackingStage.classList.add("stage-live");

  window.clearInterval(detectionInterval);
  detectionInterval = window.setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }, 100);
});

["pause", "ended"].forEach((eventName) => {
  video.addEventListener(eventName, () => {
    window.clearInterval(detectionInterval);
  });
});
