let currentIndex = 0;
let currentUrls = [];

async function generatePlaylist() {
  const prompt = document.getElementById('prompt').value;
  const res = await fetch('/generate', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ prompt })
  });
  const data = await res.json();
  const playlist = document.getElementById('playlist');
  const playerContainer = document.getElementById('player-container');
  playlist.innerHTML = '';
  playerContainer.innerHTML = '';
  currentUrls = data.urls;
  currentIndex = 0;

  data.urls.forEach((url, i) => {
    const li = document.createElement('li');
    li.textContent = data.songs[i];
    li.onclick = () => playSong(i);
    playlist.appendChild(li);
  });

  playSong(0);
}

function playSong(index) {
  currentIndex = index;
  const videoId = new URL(currentUrls[index]).searchParams.get('v');
  const playerContainer = document.getElementById('player-container');
  playerContainer.innerHTML = '';

  const iframe = document.createElement('iframe');
  iframe.width = '560';
  iframe.height = '315';
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
  iframe.id = 'ytplayer';
  iframe.allow = 'autoplay';
  playerContainer.appendChild(iframe);
}

function onYouTubeIframeAPIReady() {
  const player = new YT.Player('ytplayer', {
    events: {
      'onStateChange': function(event) {
        if (event.data === YT.PlayerState.ENDED) {
          if (currentIndex + 1 < currentUrls.length) {
            playSong(currentIndex + 1);
          }
        }
      }
    }
  });
}

function startVoiceCommand() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById('prompt').value = transcript;
    generatePlaylist();
  };

  recognition.onerror = function(event) {
    alert('Voice recognition error: ' + event.error);
  };
}

function pollAsciiStream() {
  fetch('/ascii')
    .then(res => res.json())
    .then(data => {
      document.getElementById('ascii-output').textContent = data.frame;
    })
    .catch(console.error);
}

setInterval(pollAsciiStream, 100);

function downloadYouTubeVideo() {
  const query = document.getElementById('yt-search').value;
  fetch('/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || data.error);
    })
    .catch(err => alert('Error: ' + err));
}

// Load YouTube IFrame API
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(tag);


// --- Ctrl+Drag Swap Logic with Magnetic Snap ---
let isCtrlPressed = false;
let draggedPanel = null;
let startX = 0;
let currentDX = 0;

document.addEventListener('keydown', e => {
  if (e.key === 'Control') isCtrlPressed = true;
});
document.addEventListener('keyup', e => {
  if (e.key === 'Control') isCtrlPressed = false;
});

document.querySelectorAll('.left, .right').forEach(panel => {
  panel.addEventListener('mousedown', e => {
    if (!isCtrlPressed) return;
    draggedPanel = panel;
    startX = e.clientX;
    currentDX = 0;
    panel.classList.add('dragging');
    panel.style.zIndex = 10;
    panel.style.transition = 'none';
  });
});

document.addEventListener('mousemove', e => {
  if (!draggedPanel) return;
  currentDX = e.clientX - startX;
  draggedPanel.style.transform = `translateX(${currentDX}px)`;
});

document.addEventListener('mouseup', () => {
  if (!draggedPanel) return;

  const container = document.querySelector('.container');
  const panels = Array.from(container.children);
  const otherPanel = panels.find(p => p !== draggedPanel);

  const rect1 = draggedPanel.getBoundingClientRect();
  const rect2 = otherPanel.getBoundingClientRect();
  const overlap = rect1.left < rect2.right && rect1.right > rect2.left;

  draggedPanel.style.transition = 'transform 0.15s ease-out';
  draggedPanel.style.transform = overlap
    ? `translateX(${currentDX + (currentDX > 0 ? 30 : -30)}px)`
    : 'translateX(0)';

  setTimeout(() => {
    if (overlap) {
      container.insertBefore(draggedPanel, otherPanel.nextSibling);
    }
    draggedPanel.style.transition = '';
    draggedPanel.style.transform = '';
    draggedPanel.style.zIndex = '';
    draggedPanel.classList.remove('dragging');
    draggedPanel = null;
  }, 160);
});
