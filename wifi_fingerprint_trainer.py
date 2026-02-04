"""
Wi-Fi Fingerprint Trainer for Smart Attendance System
=====================================================
This script runs on Windows and collects Wi-Fi fingerprints using netsh.

Usage:
    python wifi_fingerprint_trainer.py

Output:
    Creates JSON file: fingerprint_<roomId>.json
"""

import subprocess
import json
import re
import sys
from collections import defaultdict
from datetime import datetime

def scan_wifi_networks():
    """
    Run netsh command to get Wi-Fi networks with BSSID.
    Returns list of dicts: [{"bssid": "...", "rssi": -XX}, ...]
    """
    try:
        result = subprocess.run(
            ["netsh", "wlan", "show", "networks", "mode=bssid"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="ignore"
        )
        
        if result.returncode != 0:
            print(f"❌ Error running netsh: {result.stderr}")
            return []
        
        output = result.stdout
        networks = []
        
        # Parse netsh output
        current_ssid = None
        current_bssid = None
        current_signal = None
        
        for line in output.split('\n'):
            line = line.strip()
            
            # SSID line: "SSID 1 : NetworkName"
            if line.startswith("SSID"):
                parts = line.split(":", 1)
                if len(parts) > 1:
                    current_ssid = parts[1].strip()
            
            # BSSID line: "BSSID 1 : aa:bb:cc:dd:ee:ff"
            elif "BSSID" in line and ":" in line:
                parts = line.split(":", 1)
                if len(parts) > 1:
                    bssid_str = parts[1].strip()
                    # Validate BSSID format (mac address)
                    if re.match(r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$', bssid_str):
                        current_bssid = bssid_str.replace("-", ":").lower()
            
            # Signal line: "Signal : 85%"
            elif "Signal" in line and "%" in line:
                signal_match = re.search(r'(\d+)%', line)
                if signal_match:
                    signal_percent = int(signal_match.group(1))
                    # Convert percentage to approximate RSSI (rough conversion)
                    # 100% ≈ -30 dBm, 0% ≈ -100 dBm
                    current_signal = -100 + (signal_percent * 0.7)
            
            # Network separator or end of network block
            if current_bssid and current_signal is not None:
                networks.append({
                    "bssid": current_bssid,
                    "rssi": round(current_signal, 1)
                })
                current_bssid = None
                current_signal = None
        
        return networks
        
    except Exception as e:
        print(f"❌ Error scanning Wi-Fi: {e}")
        return []

def collect_fingerprint(room_id, num_scans=30):
    """
    Collect multiple scans and average RSSI per BSSID.
    
    Args:
        room_id: Classroom identifier (e.g., "CSE-202")
        num_scans: Number of scans to perform (default: 30)
    
    Returns:
        dict: {"roomId": "...", "fingerprint": {"bssid": rssi, ...}}
    """
    print(f"\n📡 Collecting fingerprint for room: {room_id}")
    print(f"   Performing {num_scans} scans...\n")
    
    # Store all RSSI values per BSSID
    bssid_rssis = defaultdict(list)
    
    for scan_num in range(1, num_scans + 1):
        print(f"   Scan {scan_num}/{num_scans}...", end="\r")
        
        networks = scan_wifi_networks()
        
        for net in networks:
            bssid = net["bssid"]
            rssi = net["rssi"]
            bssid_rssis[bssid].append(rssi)
        
        # Small delay between scans
        import time
        time.sleep(0.5)
    
    print(f"\n   ✅ Completed {num_scans} scans\n")
    
    # Check minimum AP requirement
    if len(bssid_rssis) < 3:
        print(f"\n⚠️  WARNING: Only {len(bssid_rssis)} access point(s) detected!")
        print("   WiFi fingerprinting requires at least 3 APs for accuracy.")
        print("   Current fingerprint may not work reliably.\n")
        print("   Recommendations:")
        print("   1. Move to location with more WiFi networks")
        print("   2. Enable WiFi on nearby devices/routers")
        print("   3. Use alternative attendance methods (QR/Face)\n")
        
        proceed = input("   Continue anyway? (y/n): ").strip().lower()
        if proceed != 'y':
            print("\n❌ Fingerprint collection cancelled.")
            sys.exit(0)
    
    # Average RSSI per BSSID with outlier removal
    fingerprint = {}
    for bssid, rssi_list in bssid_rssis.items():
        # Remove outliers (top/bottom 10% if enough samples)
        if len(rssi_list) >= 10:
            rssi_list_sorted = sorted(rssi_list)
            trim_count = max(1, len(rssi_list) // 10)
            rssi_list = rssi_list_sorted[trim_count:-trim_count]
        
        avg_rssi = sum(rssi_list) / len(rssi_list)
        fingerprint[bssid] = round(avg_rssi, 1)
    
    # Sort by BSSID for consistent output
    fingerprint = dict(sorted(fingerprint.items()))
    
    result = {
        "roomId": room_id,
        "fingerprint": fingerprint,
        "createdAt": datetime.now().isoformat(),
        "numScans": num_scans,
        "numAPs": len(fingerprint)
    }
    
    return result

def save_fingerprint(data, filename=None):
    """
    Save fingerprint to JSON file.
    
    Args:
        data: Fingerprint data dict
        filename: Optional custom filename (default: fingerprint_<roomId>.json)
    """
    if filename is None:
        filename = f"fingerprint_{data['roomId']}.json"
    
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Fingerprint saved to: {filename}")
        print(f"   Room: {data['roomId']}")
        print(f"   Access Points: {data['numAPs']}")
        print(f"   Scans: {data['numScans']}\n")
        
        return filename
    except Exception as e:
        print(f"❌ Error saving file: {e}")
        return None

def main():
    """
    Main function - interactive fingerprint collection.
    """
    print("=" * 60)
    print("Wi-Fi Fingerprint Trainer")
    print("Smart Attendance System - Offline Training")
    print("=" * 60)
    
    # Get room ID from user
    room_id = input("\nEnter classroom ID (e.g., CSE-202): ").strip()
    
    if not room_id:
        print("❌ Room ID cannot be empty!")
        sys.exit(1)
    
    # Get number of scans (optional)
    num_scans_input = input("Number of scans (default: 30): ").strip()
    num_scans = int(num_scans_input) if num_scans_input.isdigit() else 30
    
    if num_scans < 1:
        num_scans = 30
    
    # Collect fingerprint
    try:
        fingerprint_data = collect_fingerprint(room_id, num_scans)
        
        # Save to file
        filename = save_fingerprint(fingerprint_data)
        
        if filename:
            print("=" * 60)
            print("✅ Training complete!")
            print(f"\nNext steps:")
            print(f"1. Review the JSON file: {filename}")
            print(f"2. Import it into MongoDB collection: wifi_fingerprints")
            print(f"3. Use MongoDB Compass or Thunder Client to insert")
            print("=" * 60)
        else:
            print("❌ Failed to save fingerprint")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n\n❌ Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

