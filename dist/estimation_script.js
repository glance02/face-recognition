const imageUpload = document.getElementById("upload");
const analysisStage = document.getElementById("analysis-stage");

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
  faceapi.nets.ageGenderNet.loadFromUri(
    "https://raw.githubusercontent.com/willtrinh/face-recognition/master/models/"
  ),
  faceapi.nets.ssdMobilenetv1.loadFromUri(
    "https://raw.githubusercontent.com/willtrinh/face-recognition/master/models/"
  ),
]).then(start);

async function start() {
  const container = document.createElement("div");
  container.className = "analysis-stage__media";
  analysisStage.append(container);

  let image;
  let canvas;

  imageUpload.addEventListener("change", async () => {
    if (!imageUpload.files.length) {
      return;
    }

    if (image) {
      image.remove();
    }
    if (canvas) {
      canvas.remove();
    }

    image = await faceapi.bufferToImage(imageUpload.files[0]);
    container.append(image);

    canvas = faceapi.createCanvasFromMedia(image);
    container.append(canvas);

    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);

    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withAgeAndGender();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    faceapi.draw.drawDetections(canvas, resizedDetections);

    resizedDetections.forEach((detection, index) => {
      const box = resizedDetections[index].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: `${Math.round(detection.age)} years old ${detection.gender}`,
      });
      drawBox.draw(canvas);
    });

    analysisStage.classList.add("stage-ready");
  });
}
