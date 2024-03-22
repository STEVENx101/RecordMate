# In your Python script
import sys
import sqlite3
from PIL import Image
import os

def retrieve_screenshots(collection_name, save_path):
    conn = sqlite3.connect(f'{collection_name}.db')
    cursor = conn.cursor()

    cursor.execute("SELECT id, log, screenshot FROM Captures")
    rows = cursor.fetchall()

    for row in rows:
        id, log, screenshot = row
        if screenshot is not None:
            screenshot_path = os.path.join(save_path, f"{id}.jpg")
            with open(screenshot_path, "wb") as f:
                f.write(screenshot)
            print(f"Screenshot saved at: {screenshot_path}")
        print(f"ID: {id}, Log: {log}")

    conn.close()

if __name__ == "__main__":
    try:
        collection_name = sys.argv[1]
        save_path = r"..\\frontend"  # Using raw string literal
        retrieve_screenshots(collection_name, save_path)
    except KeyboardInterrupt:
        print("Retrieval stopped by user.")
