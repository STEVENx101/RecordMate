import psutil
import time
import pymongo
import pyscreenshot as ImageGrab
from pynput import mouse

# Connect to MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["monitoring_logs"]
collection = db["logs"]

# Dictionary to store running monitored processes
running_processes = {}
printed_launch_processes = set()
printed_exit_processes = set()
monitored_apps = ["code.exe", "excel.exe", "word.exe", "powerpnt.exe", "discord.exe"]

def is_background_process(pid):
    try:
        process = psutil.Process(pid)
        try:
            if process.username() == "SYSTEM":
                return True
        except psutil.AccessDenied:
            pass
        if process.status() == psutil.STATUS_IDLE:
            return True
        parent = process.parent()
        if parent is not None and parent.name() == "services.exe":
            return True
        return False
    except psutil.NoSuchProcess:
        return True

def track_processes():
    def on_click(x, y, button, pressed):
        if button == mouse.Button.middle and pressed:
            im = ImageGrab.grab()
            img_bytes = im.tobytes()
            collection.insert_one({'screenshot': img_bytes})

    # Start listening for mouse events
    with mouse.Listener(on_click=on_click) as listener:
        while True:
            current_processes = {p.pid: p.name() for p in psutil.process_iter(['pid', 'name'])}

            for pid, name in current_processes.items():
                if name.lower() in monitored_apps and pid not in running_processes and not is_background_process(pid):
                    if name.lower() not in printed_launch_processes:
                        log_string = f"Application launched: {name}"
                        print(log_string)
                        collection.insert_one({"log": log_string})
                        printed_launch_processes.add(name.lower())
                    running_processes[pid] = name

            for pid, name in list(running_processes.items()):
                if name.lower() in monitored_apps and pid not in current_processes:
                    if name.lower() not in printed_exit_processes:
                        log_string = f"Application exited: {name}"
                        print(log_string)
                        collection.insert_one({"log": log_string})
                        printed_exit_processes.add(name.lower())
                    if name.lower() in printed_launch_processes:
                        printed_launch_processes.remove(name.lower())
                    del running_processes[pid]

            time.sleep(10)

if __name__ == "__main__":
    try:
        track_processes()
    except KeyboardInterrupt:
        print("Monitoring stopped by user.")
