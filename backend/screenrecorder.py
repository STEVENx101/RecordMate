import os
import pyautogui
import pymongo
from bson.binary import Binary
from pynput import mouse, keyboard

# Connect to MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["screenshot_database"]
collection = db["screenshots"]

# Global variables
folder_name = None
folder_created = False
running = True

# Function to process mouse clicks
def on_click(x, y, button, pressed):
    global folder_created, running
    if pressed and button == mouse.Button.middle and folder_created and running:
        # Take a screenshot when middle mouse button is clicked and folder is created
        screenshot = pyautogui.screenshot()
        screenshot_bytes = screenshot.tobytes()
        save_screenshot_to_mongodb(x, y, screenshot_bytes)

# Function to save screenshot to MongoDB
def save_screenshot_to_mongodb(x, y, image_data):
    screenshot_data = {
        "folder_name": folder_name,
        "x": x,
        "y": y,
        "image_data": Binary(image_data)
    }
    collection.insert_one(screenshot_data)

# Ask user for folder name
def ask_folder_name():
    global folder_name, folder_created
    folder_name = input("Enter folder name to save screenshots: ")
    if not os.path.exists(folder_name):
        os.makedirs(folder_name)
        folder_created = True
    else:
        print("Folder already exists. Please choose a different name.")
        ask_folder_name()

# Function to process keyboard events
def on_key_release(key):
    global running
    if key == keyboard.Key.esc:
        running = False
        stop_program()

# Function to stop the program
def stop_program():
    # Stop the mouse listener
    mouse_listener.stop()
    print("Program stopped")

# Start by asking for folder name
ask_folder_name()

# Register mouse click listener
mouse_listener = mouse.Listener(on_click=on_click)
mouse_listener.start()

# Register keyboard event listener
keyboard_listener = keyboard.Listener(on_release=on_key_release)
keyboard_listener.start()

# Keep the script running
keyboard_listener.join()
