async function generatePlaylist() {
  const prompt = document.getElementById('prompt').value;
  const res = await fetch('/generate', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({prompt})
  });
  const data = await res.json();
  const playlist = document.getElementById('playlist');
  const playerContainer = document.getElementById('player-container');
  playlist.innerHTML = '';
  playerContainer.innerHTML = '';

  data.urls.forEach((url, i) => {
    const li = document.createElement('li');
    li.textContent = data.songs[i];
    playlist.appendChild(li);

    if (i === 0) {
      const videoId = new URL(url).searchParams.get('v');
      const iframe = document.createElement('iframe');
      iframe.width = "560";
      iframe.height = "315";
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      iframe.allow = "autoplay";
      playerContainer.appendChild(iframe);
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
