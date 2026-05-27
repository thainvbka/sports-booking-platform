import urllib.parse
import zlib
from PIL import Image
import xml.etree.ElementTree as ET

def extract_drawio_xml(png_path):
    im = Image.open(png_path)
    # Check for text chunks in PNG
    mxfile = None
    for key, value in im.info.items():
        if key == 'mxfile':
            mxfile = value
            break
    
    if not mxfile:
        print("No mxfile metadata key found. Checking text chunks...")
        # Try raw chunks if PIL didn't parse it automatically
        with open(png_path, 'rb') as f:
            content = f.read()
            # Look for mxfile in the file content
            idx = content.find(b'mxfile')
            if idx != -1:
                print("Found mxfile substring in binary content!")
                # Drawio mxfile is often inside zTXt/tEXt chunks. 
                # Let's see if we can find mxfile tag
                start_tag = content.find(b'<mxfile')
                end_tag = content.find(b'</mxfile>')
                if start_tag != -1 and end_tag != -1:
                    mxfile = content[start_tag:end_tag+9].decode('utf-8', errors='ignore')
    
    if not mxfile:
        print("Could not find draw.io metadata in PNG.")
        return
    
    print("Successfully found draw.io metadata!")
    # Draw.io embedded xml is usually URL encoded, or compressed, or raw XML
    if mxfile.startswith('%3C'):
        # URL encoded
        mxfile = urllib.parse.unquote(mxfile)
    
    # Save the raw drawio metadata to a file for review
    with open('/home/thainv/workspace/sports-booking-platform/baocao/extracted_drawio.xml', 'w', encoding='utf-8') as out:
        out.write(mxfile)
    print("Saved metadata to /home/thainv/workspace/sports-booking-platform/baocao/extracted_drawio.xml")

    # Let's extract any use case text labels!
    # Draw.io XML contains mxCell elements with "value" attributes containing the labels.
    try:
        # A quick regex or simple element search for values
        import re
        # Drawio values are often HTML-escaped. Let's find value="..."
        values = re.findall(r'value="([^"]+)"', mxfile)
        clean_values = []
        for val in values:
            # Clean up HTML tags like <br>, <div>, etc.
            clean = re.sub(r'<[^>]+>', ' ', val)
            clean = urllib.parse.unquote(clean)
            # Unescape some common HTML entities
            clean = clean.replace('&nbsp;', ' ').replace('&quot;', '"').replace('&#39;', "'").replace('&lt;', '<').replace('&gt;', '>')
            clean = ' '.join(clean.split())
            if clean and clean not in clean_values:
                clean_values.append(clean)
        
        print("\n=== All Text/Labels Found in Diagram ===")
        for cv in clean_values:
            print(f"- {cv}")
    except Exception as e:
        print("Error parsing text:", e)

if __name__ == "__main__":
    extract_drawio_xml('/home/thainv/workspace/sports-booking-platform/images/phanraquanlikhuphuchopvasandau.png')
