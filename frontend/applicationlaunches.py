import psutil
import time
import sqlite3
import pyscreenshot as ImageGrab
from pynput import mouse
import sys
import queue
import threading
import io

def create_table_if_not_exists(conn):
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS Captures
                      (id INTEGER PRIMARY KEY AUTOINCREMENT, log TEXT, screenshot BLOB)''')

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

def track_processes(collection_name):
    conn = sqlite3.connect(f'{collection_name}.db')
    create_table_if_not_exists(conn)
    cursor = conn.cursor()

    # Dictionary to store running monitored processes
    running_processes = {}
    printed_launch_processes = set()
    printed_exit_processes = set()
    monitored_apps = ["code.exe", "excel.exe", "winword.exe", "powerpnt.exe", "discord.exe"]
    
    # Queue to communicate between threads
    queue_lock = threading.Lock()
    db_queue = queue.Queue()

    def on_click(x, y, button, pressed):
        if button == mouse.Button.middle and pressed:
            im = ImageGrab.grab()
            img_byte_array = io.BytesIO()
            im.save(img_byte_array, format='PNG')
            img_bytes = img_byte_array.getvalue()
            log_string = "Screenshot captured"
            db_queue.put((log_string, img_bytes))


    def db_worker():
        conn = sqlite3.connect(f'{collection_name}.db')
        cursor = conn.cursor()

        while True:
            try:
                item = db_queue.get(timeout=1)
                if len(item) == 1:
                    log_string = item[0]
                    cursor.execute("INSERT INTO Captures (log) VALUES (?)", (log_string,))
                    conn.commit()
                elif len(item) == 2:
                    log_string, img_bytes = item
                    cursor.execute("INSERT INTO Captures (log, screenshot) VALUES (?, ?)", (log_string, img_bytes))
                    conn.commit()
            except queue.Empty:
                pass


    db_thread = threading.Thread(target=db_worker)
    db_thread.daemon = True
    db_thread.start()

    # Start listening for mouse events
    with mouse.Listener(on_click=on_click) as listener:
        while True:
            current_processes = {p.pid: p.name() for p in psutil.process_iter(['pid', 'name'])}

            for pid, name in current_processes.items():
                if name.lower() in monitored_apps and pid not in running_processes and not is_background_process(pid):
                    if name.lower() not in printed_launch_processes:
                        log_string = f"Application launched: {name}"
                        print(log_string)
                        db_queue.put((log_string,))
                        printed_launch_processes.add(name.lower())
                    running_processes[pid] = name

            for pid, name in list(running_processes.items()):
                if name.lower() in monitored_apps and pid not in current_processes:
                    if name.lower() not in printed_exit_processes:
                        log_string = f"Application exited: {name}"
                        print(log_string)
                        db_queue.put((log_string,))
                        printed_exit_processes.add(name.lower())
                    if name.lower() in printed_launch_processes:
                        printed_launch_processes.remove(name.lower())
                    del running_processes[pid]

            time.sleep(2)

if __name__ == "__main__":
    try:
        if len(sys.argv) != 2:
            print("Usage: python script.py <collection_name>")
            sys.exit(1)
        collection_name = sys.argv[1]
        track_processes(collection_name)
    except KeyboardInterrupt:
        print("Monitoring stopped by user.")
