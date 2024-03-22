import sqlite3
from PIL import Image


def retrieve_screenshots(collection_name):
    conn = sqlite3.connect(f'{collection_name}.db')
    cursor = conn.cursor()

    cursor.execute("SELECT id, log, screenshot FROM Captures")
    rows = cursor.fetchall()

    for row in rows:
        id, log, screenshot = row
        if screenshot is not None:
            with open(f"{id}.jpg", "wb") as f:
                f.write(screenshot)
        print(f"ID: {id}, Log: {log}")

    conn.close()

if __name__ == "__main__":
    try:
        collection_name = "qwe"
        retrieve_screenshots(collection_name)
    except KeyboardInterrupt:
        print("Retrieval stopped by user.")

