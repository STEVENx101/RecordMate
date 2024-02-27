import tkinter as tk
from tkinter import messagebox
import pymongo

# Connect to MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["screenshot_database"]
collection = db["screenshots"]

# Function to fetch data from MongoDB using a filter
def fetch_data_from_mongodb(filter_value):
    try:
        filter_value = int(filter_value)  # Assuming filter_value is an integer
        filter = {"x": filter_value}  # Use your filter criteria here
        result = collection.find(filter)
        return list(result)
    except ValueError:
        messagebox.showerror("Error", "Please enter a valid filter value (integer)")

# Function to handle the search button click
def on_search_button_click():
    filter_value = filter_entry.get()
    data = fetch_data_from_mongodb(filter_value)
    if data:
        display_text.delete(1.0, tk.END)  # Clear previous data
        for item in data:
            display_text.insert(tk.END, f"{item}\n")
    else:
        messagebox.showinfo("No Data", "No data found for the specified filter")

# Create the main window
window = tk.Tk()
window.title("MongoDB Data Viewer")

# Create GUI elements
filter_label = tk.Label(window, text="Enter filter value:")
filter_label.pack()

filter_entry = tk.Entry(window)
filter_entry.pack()

search_button = tk.Button(window, text="Search", command=on_search_button_click)
search_button.pack()

display_text = tk.Text(window, height=10, width=50)
display_text.pack()

# Start the GUI event loop
window.mainloop()
