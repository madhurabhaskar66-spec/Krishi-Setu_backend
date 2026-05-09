import subprocess
import os
import sys

def start_server(folder, port):
    print(f"Starting {folder} on port {port}")
    return subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--port", str(port)],
        cwd=folder
    )

servers = [
    ("agri_price_tracking", 8001),
    ("agri_chat_agent", 8002),
    ("agri_call_agent", 8003),
    ("agri_verified_mark", 8004)
]

processes = []
for folder, port in servers:
    if os.path.exists(folder):
        p = start_server(folder, port)
        processes.append(p)

print("All secondary servers started in background on ports 8001-8004. Press Ctrl+C to kill.")
try:
    for p in processes:
        p.wait()
except KeyboardInterrupt:
    for p in processes:
        p.terminate()
