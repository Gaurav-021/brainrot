import cv2
import os
import time
import subprocess
import requests

# video_path = "spinning_record.mp4"
# video_path = "cat.mp4"
# video_path = "thor.mp4"
video_path = "./video/rick2.mp4"
temp_frame_path = "frame.jpg"
ascii_width = 130
SERVER_URL = "http://localhost:5080/ascii"

def replace_white_with_space(ascii_frame):
    # Replace all the characters representing 'white' with space
    # In most ASCII art, bright areas are represented by characters like '@', '#', and '8', etc.
    # You can define your own set of characters to replace.
   
    ascii_frame = ascii_frame.replace("M", " ")  # Replace with space
   
    return ascii_frame

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
            # Process the ASCII frame to replace white (bright) areas with spaces
            ascii_frame = replace_white_with_space(ascii_frame)

            try:
                requests.post(SERVER_URL, json={"frame": ascii_frame})
            except requests.exceptions.RequestException as e:
                print("Failed to send frame:", e)

            time.sleep(.01)  # Adjust for FPS
    finally:
        cap.release()
        if os.path.exists(temp_frame_path):
            os.remove(temp_frame_path)

    print("🔁 Restarting video loop...")