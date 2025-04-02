# 🧠 brainrot

**brainrot** is a hacker-themed AI music assistant with voice commands, real-time GPT song recommendations, and a retro terminal UI. It streams music videos based on your vibe, shows a live ASCII video feed, and lets you control playback with your voice or keyboard.

---

## 🚀 Features

- 🎵 AI-generated **lyrical song recommendations** using GPT-4
- 📺 Embedded **YouTube Music** player (auto-skips unavailable videos)
- 🗣️ Voice & text **commands** via a terminal-style input
- 🧠 GPT filters for **lyrical-only** videos
- 📼 Live **ASCII webcam or video feed** using OpenCV + `jp2a`
- 🖤 Retro **dark mode hacker aesthetic**

---

## 📦 Installation

### 1. Clone the repo

```bash
git clone https://github.com/Gaurav-021/brainrot.git
cd brainrot/
```

### 2. (Optional) Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate  
# Windows: venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip3 install -r requirements.txt
```

### 4. Install `jp2a` (for ASCII video)

- **Ubuntu/Debian:**

  ```bash
  sudo apt install jp2a
  ```

- **macOS (with Homebrew):**

  ```bash
  brew install jp2a
  ```

---

## 🔑 API Key Setup

Create a `config.yaml` file in the root directory:

```yaml
api_key: YOUR_OPENAI_API_KEY
```

---

## 🧠 Run the App

### 1. Start the Flask backend

```bash
python app.py
```

### 2. Start the ASCII video stream

```bash
python ascii_video_stream.py
```

> Then open your browser at [http://localhost:5080](http://localhost:5080)

---

## 🗣️ Commands

You can type or say commands in the terminal UI.

| Command Example                  | Action                                      |
|----------------------------------|---------------------------------------------|
| `recommend lo-fi study music`   | AI recommends 5 lyrical lo-fi tracks        |
| `next`                           | Skip to the next song                       |
| `prev`                           | Go back to the previous song                |
| `help`                           | Show all available commands                 |
| `sad jazz breakup vibes`         | AI curates a matching playlist              |

---

## 🎥 Customizing ASCII Feed

In `ascii_video_stream.py`, change the video:

```python
video_path = "cat.mp4"
```

To use a webcam instead:

```python
video_path = 0  # For default webcam
```

Make sure `jp2a` and `OpenCV` are installed.

---

## 🗂 Project Structure

```
brainrot/
├── app.py                  # Flask backend
├── ascii_video_stream.py   # ASCII video streamer
├── templates/
│   └── index.html          # Terminal-style frontend
├── config.yaml             # OpenAI API key config
├── requirements.txt
├── *.mp4                   # Background videos (e.g. cat.mp4, thor.mp4)
```

---

## ⚡ Tech Stack

- **Python**, **Flask**
- **OpenAI GPT-4 API**
- **YouTube Music API (ytmusicapi)**
- **OpenCV** + **jp2a**
- **HTML/CSS/JS** frontend with terminal theme

---

## 🛠️ Ideas for Future Additions

- 🧠 Personalized **mood-based AI playlists**
- 💾 Save/load **playlist history**
- 🔊 Volume & playback speed control

---

## 📜 License

MIT — use it, remix it, vibe with it.

---

Made with brainrot 🖤
