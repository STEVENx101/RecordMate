import psutil
import time

# Dictionary to store running monitored processes
running_processes = {}

# Set to store already printed processes for launch and exit
printed_launch_processes = set()
printed_exit_processes = set()

# List of application names to monitor
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
    while True:
        # Get the list of running processes
        current_processes = {p.pid: p.name() for p in psutil.process_iter(['pid', 'name'])}

        # Check for new processes (application launches)
        for pid, name in current_processes.items():
            if name.lower() in monitored_apps and pid not in running_processes and not is_background_process(pid):
                if name.lower() not in printed_launch_processes:
                    print(f"Application launched: {name}")
                    printed_launch_processes.add(name.lower())
                running_processes[pid] = name

        # Check for exited processes (application exits)
        for pid, name in list(running_processes.items()):
            if name.lower() in monitored_apps and pid not in current_processes:
                if name.lower() not in printed_exit_processes:
                    print(f"Application exited: {name}")
                    printed_exit_processes.add(name.lower())
                if name.lower() in printed_launch_processes:
                    printed_launch_processes.remove(name.lower())
                del running_processes[pid]

        # Sleep for some time before checking again
        time.sleep(10)

if __name__ == "__main__":
    try:
        track_processes()
    except KeyboardInterrupt:
        print("Monitoring stopped by user.")