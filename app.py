from flask import Flask, request, render_template, jsonify
from ytmusicapi import YTMusic
from google import genai
import threading
import yaml
import re

def load_api_key(config_path='config.yaml'):
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    return config['gemini']

client = genai.Client(api_key=load_api_key())

ascii_frame = ""
ascii_lock = threading.Lock()

app = Flask(__name__)
ytmusic = YTMusic()

def get_song_recommendations(input):

    prompt = f"List me 5 songs with artist names that fits the request of {input} without any extra responses. You're a music assistant that gets music that are only lyrics music video. Just list the songs, no commentary. If I list a song name, make that the first song and make the rest similar songs."

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    print(response)
    return extract_songs(str(response.candidates[0].content.parts[0].text))

def extract_songs(output):
    lines = output.strip().split("\n")
    songs = []
    for line in lines:
        match = re.match(r'[\d\-\.\)]*\s*"?(.+?)"?\s*[-\u2013]\s*(.+)', line.strip())
        if match:
            title, artist = match.groups()
            songs.append(f"{title} {artist}")
    return songs

def get_youtube_urls(song_list):
    urls = []
    for song in song_list:
        results = ytmusic.search(song, filter="songs")
        if results and 'videoId' in results[0]:
            urls.append(f"https://www.youtube.com/watch?v={results[0]['videoId']}")
    return urls

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    prompt = data.get("prompt")
    if not prompt:
        return jsonify({"error": "No prompt received"}), 400
    songs = get_song_recommendations(prompt)
    urls = get_youtube_urls(songs)
    return jsonify({"songs": songs, "urls": urls})

@app.route('/ascii', methods=['GET'])
def get_ascii():
    with ascii_lock:
        return jsonify({"frame": ascii_frame})

@app.route('/ascii', methods=['POST'])
def update_ascii():
    global ascii_frame
    data = request.json
    with ascii_lock:
        ascii_frame = data.get("frame", "")
    return "", 204

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5080)
