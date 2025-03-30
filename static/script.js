const input = document.getElementById('prompt');
const playlistElement = document.getElementById('playlist');
const playerStatus = document.getElementById('player-status');
const ytPlayer = document.getElementById('yt-player');
const asciiOutput = document.getElementById('ascii-output');

let playlist = [];
let videoIds = [];
let currentIndex = 0;

// 🔁 Polling ASCII
setInterval(() => {
  fetch('/ascii')
    .then(res => res.json())
    .then(data => {
      asciiOutput.textContent = data.frame;
    })
    .catch(console.error);
}, 100);

// 🎵 UI + Playback
function updatePlaylistUI() {
  playlistElement.innerHTML = playlist.map((song, idx) =>
    `<li class="${idx === currentIndex ? 'active' : ''}">${song}</li>`
  ).join('');

  playerStatus.innerText = `🎵 Now playing: ${playlist[currentIndex] || "Nothing"}`;
  ytPlayer.src = `https://www.youtube.com/embed/${videoIds[currentIndex] || ""}?autoplay=1`;

  document.querySelectorAll("#playlist li").forEach((li, idx) => {
    li.onclick = () => {
      currentIndex = idx;
      updatePlaylistUI();
    };
  });
}

// 📜 Append to ASCII output
function appendToASCII(text) {
  asciiOutput.textContent += `\n${text}`;
  asciiOutput.scrollTop = asciiOutput.scrollHeight;
}

// 🤖 ChatGPT call
async function fetchGPTSuggestions(prompt) {
  const res = await fetch('/generate', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  const data = await res.json();
  playlist = data.songs || [];
  videoIds = (data.urls || []).map(url => new URL(url).searchParams.get('v'));
  currentIndex = 0;
  updatePlaylistUI();
}

// 🎙️ Voice Recognition Handler
function startVoiceRecognition() {
  const existingGlyph = document.getElementById('voice-status');
  if (existingGlyph) existingGlyph.remove();

  const voiceGlyph = document.createElement('div');
  voiceGlyph.innerHTML = `
    🎤 Listening<span class="dot-anim">.</span>
    <span class="dot-anim">.</span>
    <span class="dot-anim">.</span>
  `;
  voiceGlyph.style.position = 'absolute';
  voiceGlyph.style.bottom = '50px';
  voiceGlyph.style.left = '10px';
  voiceGlyph.style.color = 'lime';
  voiceGlyph.style.fontFamily = 'monospace';
  voiceGlyph.id = 'voice-status';
  document.body.appendChild(voiceGlyph);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceGlyph.innerText = '🎤 Voice recognition not supported.';
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    input.value = transcript;
    input.focus();
    appendToASCII(`> ${transcript}`);
    await fetchGPTSuggestions(transcript);
    voiceGlyph.remove();
  };

  recognition.onerror = () => voiceGlyph.remove();
  recognition.onend = () => voiceGlyph.remove();
  recognition.start();
}

// 🎛️ Main Command Handler
input.addEventListener('keydown', async (e) => {
  const command = input.value.trim().toLowerCase();

  if (e.key === 'Enter') {
    input.value = '';
    appendToASCII(`> ${command}`);

    switch (command) {
      case 'list':
        updatePlaylistUI();
        break;
      case 'next':
        currentIndex = (currentIndex + 1) % playlist.length;
        updatePlaylistUI();
        break;
      case 'prev':
      case 'previous':
        currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        updatePlaylistUI();
        break;
      case 'voice':
        startVoiceRecognition();
        break;
      case 'help':
        appendToASCII(`🆘 Available Commands:
- any phrase → get GPT music recs
- next → play next song
- prev / previous → go back
- list → view current playlist
- voice → start voice recognition
- help → show this help menu`);
        break;
      default:
        await fetchGPTSuggestions(command);
    }
  }

  // ⬆️ ⬇️ Keyboard Arrow Nav
  else if (e.key === 'ArrowUp') {
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    updatePlaylistUI();
  } else if (e.key === 'ArrowDown') {
    currentIndex = (currentIndex + 1) % playlist.length;
    updatePlaylistUI();
  }
});
