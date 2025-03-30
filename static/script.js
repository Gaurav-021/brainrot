
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
