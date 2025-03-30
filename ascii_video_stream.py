import cv2
import os
import time
import subprocess
import requests

# video_path = "spinning_record.mp4"
video_path = "cat.mp4"
temp_frame_path = "frame.jpg"
ascii_width = 80
SERVER_URL = "http://localhost:5080/ascii"

while True:  # Infinite loop
    cap = cv2.VideoCapture(video_path)

    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            cv2.imwrite(temp_frame_path, frame)

            result = subprocess.run(
                ["jp2a", f"--width={ascii_width}", temp_frame_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )

            ascii_frame = result.stdout.decode("utf-8")
            try:
                requests.post(SERVER_URL, json={"frame": ascii_frame})
            except requests.exceptions.RequestException as e:
                print("Failed to send frame:", e)

            time.sleep(1 / 24)  # Adjust for FPS
    finally:
        cap.release()
        if os.path.exists(temp_frame_path):
            os.remove(temp_frame_path)

    print("🔁 Restarting video loop...")
