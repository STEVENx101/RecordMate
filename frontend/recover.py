import sys
import sqlite3
from PIL import Image
import os

def retrieve_screenshots(collection_name, save_path):
    conn = sqlite3.connect(f'{collection_name}.db')
    cursor = conn.cursor()

    cursor.execute("SELECT id, log, screenshot FROM Captures")
    rows = cursor.fetchall()

    screenshots_html = ""  # HTML string to store images and logs

    for row in rows:
        id, log, screenshot = row
        if screenshot is not None:
            screenshot_path = os.path.join(save_path, f"{id}.jpg")
            with open(screenshot_path, "wb") as f:
                f.write(screenshot)
            screenshots_html += f"<div><img src='{screenshot_path}' width='400'><p>ID: {id}, Log: {log}</p></div>"
            print(f"Screenshot saved at: {screenshot_path}")
        else:
            screenshots_html += f"<div><p>ID: {id}, Log: {log}</p></div>"

    conn.close()

    # Generating HTML page
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>RecordMate</title>
        <link rel="stylesheet" href="screenshots_logs.css">
         <script src="Signuppage.js"></script>

    </head>
    <body>
    <div class="goBackBtn" onclick="goback()">
        <div class='arrow'>
            <span></span>
            <span></span>
            <span></span>
        </div>

    </div>  
        {screenshots_html}
    </body>
    </html>
    """

    # Writing HTML content to a file
    with open("screenshots_logs.html", "w") as html_file:
        html_file.write(html_content)

    print("HTML page generated: screenshots_logs.html")

if __name__ == "__main__":
    try:
        collection_name = sys.argv[1]
        save_path = r"..\\frontend"  # Using raw string literal
        retrieve_screenshots(collection_name, save_path)
    except KeyboardInterrupt:
        print("Retrieval stopped by user.")