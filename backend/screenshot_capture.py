import pymongo
import pyscreenshot as ImageGrab
from pynput import mouse
import random
import string
import sys

# Connect to MongoDB
client = pymongo.MongoClient('mongodb://localhost:27017/')

def generate_random_name(length):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

# Dummy currently logged-in user
current_user = "v"

# Determine the database name based on the currently logged-in user
db_name = f"user_{current_user}"
db = client[db_name]

def create_collection(collection_name):
    # Create a collection for screenshots in the user's database
    collection = db['Captures']  # Use 'Captures' collection

    def on_click(x, y, button, pressed):
        if button == mouse.Button.middle and pressed:
            # Take a screenshot when the middle mouse button is pressed
            im = ImageGrab.grab()
            # Save the screenshot to the user's collection
            img_bytes = im.tobytes()
            collection.insert_one({'screenshot': img_bytes})

    # Start listening for mouse events
    with mouse.Listener(on_click=on_click) as listener:
        listener.join()

# Receive user input from Electron
for userInput in sys.stdin:
    # Generate collection name
    collection_name = userInput.strip()  # Remove newline character
    create_collection(collection_name)