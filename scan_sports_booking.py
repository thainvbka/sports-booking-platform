import re
import urllib.parse

def extract_strings(file_path):
    with open(file_path, 'rb') as f:
        data = f.read()
    
    # Find all ASCII and Latin-1 text strings of length 4 or more
    ascii_strings = re.findall(b'[a-zA-Z0-9_ \\-\\/\\.\\x80-\\xFF]{4,}', data)
    print(f"\n=== Strings in {file_path} ===")
    seen = set()
    for s in ascii_strings:
        try:
            decoded = s.decode('utf-8', errors='ignore').strip()
            if len(decoded) > 4 and decoded not in seen:
                # filter out PNG headers/junk
                if not any(x in decoded for x in ['IHDR', 'IDAT', 'IEND', 'SRGB', 'GAMA', 'PHYS']):
                    print(decoded)
                    seen.add(decoded)
        except Exception:
            pass

extract_strings('/home/thainv/workspace/sports-booking-platform/images/sports-booking.png')
