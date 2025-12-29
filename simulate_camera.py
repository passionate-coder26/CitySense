import requests
import time
import random
import datetime

# The Backend URL
url = "http://localhost:5000/api/update-live-data"

# Mock coordinates (Around Mumbai)
lat_base = 19.1136
lng_base = 72.8697

print("🚗 Starting CitySense Simulation... (Press Ctrl+C to stop)")

while True:
    # 1. Create a fake pothole detection
    detection = {
        "id": str(int(time.time())),
        "type": random.choice(["pothole", "garbage", "water_logging"]),
        "severity": random.choice(["Low", "Medium", "High", "Critical"]),
        "lat": lat_base + random.uniform(-0.01, 0.01),
        "lng": lng_base + random.uniform(-0.01, 0.01),
        "timestamp": datetime.datetime.now().isoformat(),
        "image_url": "https://via.placeholder.com/150?text=Live+Detection"
    }

    # 2. Send it to your Node.js Server
    try:
        response = requests.post(url, json=detection)
        if response.status_code == 200:
            print(f"✅ Sent: {detection['type']} ({detection['severity']})")
        else:
            print(f"❌ Error: Server returned {response.status_code}")
    except Exception as e:
        print(f"⚠️ Connection Failed: {e}")

    # 3. Wait 5 seconds before next detection
    time.sleep(5)