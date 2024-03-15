import pymongo
import pyscreenshot as ImageGrab
from pynput import mouse
import random
import string

# Connect to MongoDB
client = pymongo.MongoClient('mongodb://localhost:27017/')

def generate_random_name(length):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

# Generate a random database name
db_name = generate_random_name(10)
db = client[db_name]
collection = db['screenshots']

def on_click(x, y, button, pressed):
    if button == mouse.Button.middle and pressed:
        # Take a screenshot when the middle mouse button is pressed
        im = ImageGrab.grab()
        # Save the screenshot to MongoDB
        img_bytes = im.tobytes()
        collection.insert_one({'screenshot': img_bytes})

# Start listening for mouse events
with mouse.Listener(on_click=on_click) as listener:
    listener.join()
