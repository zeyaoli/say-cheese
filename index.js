let width = 640;
let height = 0;
// init streaming state
let streaming = false;

let video = null;
let canvas = null;
let photo = null;
let failedText = null;

const SpeechRecognition = webkitSpeechRecognition;
const recognition = new SpeechRecognition();

const startStreaming = () => {
  video = document.getElementById("video");
  canvas = document.getElementById("canvas");
  photo = document.getElementById("photo");
  failedText = document.getElementById("failed");
  canvas.style.display = "none";
  photo.style.display = "none";
  failedText.style.display = "none";

  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
    })
    .catch((err) => {
      console.log("An error occurred: " + err);
    });

  video.addEventListener(
    "canplay",
    function (ev) {
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth / width);

        // Firefox currently has a bug where the height can't be read from
        // the video, so we will make assumptions if this happens.

        if (isNaN(height)) {
          height = width / (4 / 3);
        }

        video.setAttribute("width", width);
        video.setAttribute("height", height);
        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);
        streaming = true;
      }
    },
    false
  );
};

const clearPhoto = () => {
  let context = canvas.getContext("2d");
  context.fillStyle = "#AAA";
  context.fillRect(0, 0, canvas.width, canvas.height);

  let data = canvas.toDataURL("image/png");
  photo.setAttribute("src", data);
};

const takePicture = () => {
  let context = canvas.getContext("2d");
  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);
    photo.style.display = "flex";
    let data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
  } else {
    clearPhoto();
  }
};

const getSpeech = () => {
  recognition.lang = "en-US";
  recognition.start();
  recognition.onresult = (e) => {
    console.log(e);
    const speechResult = e.results[0][0].transcript;
    console.log(speechResult);
    //take a photo if you are saying cheese
    if (speechResult == "cheese") {
      failedText.innerHTML = ` `;
      failedText.style.display = "none";
      takePicture();
    } else {
      clearPhoto();
      photo.style.display = "none";
      failedText.innerHTML = `You failed to pronounce 'cheese' as ${speechResult}, try again!`;
      failedText.style.display = "flex";
    }
  };
  recognition.onend = () => {
    console.log(`talk's over`);
    recognition.stop();
    getSpeech();
  };
};

window.addEventListener("load", startStreaming, false);
window.addEventListener("load", getSpeech, false);
