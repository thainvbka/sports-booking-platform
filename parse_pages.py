import xml.etree.ElementTree as ET
import urllib.parse
import zlib
import base64
import re

def parse_drawio_multi_pages(xml_path):
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()
        
        print(f"=== Root tag: {root.tag} ===")
        # Draw.io files have <mxfile> root, containing <diagram> children
        diagrams = root.findall('.//diagram')
        print(f"Found {len(diagrams)} diagram pages/tabs in the Draw.io file:")
        
        for idx, diag in enumerate(diagrams):
            name = diag.get('name', f'Page-{idx}')
            print(f"\n--- Page {idx+1}: {name} ---")
            
            # The content inside <diagram> is usually zlib compressed and base64 encoded
            content = diag.text
            if content:
                content = content.strip()
                try:
                    # Base64 decode
                    decoded = base64.b64decode(content)
                    # Decompress (zlib raw)
                    decompressed = zlib.decompress(decoded, -15)
                    # URL decode
                    xml_str = urllib.parse.unquote(decompressed.decode('utf-8'))
                except Exception as e:
                    print(f"  Failed decompression, using raw text: {e}")
                    xml_str = urllib.parse.unquote(content)
                
                # Let's extract all values (labels) from this page's XML
                values = re.findall(r'value="([^"]+)"', xml_str)
                clean_values = []
                for val in values:
                    clean = re.sub(r'<[^>]+>', ' ', val)
                    clean = urllib.parse.unquote(clean)
                    clean = clean.replace('&nbsp;', ' ').replace('&quot;', '"').replace('&#39;', "'").replace('&lt;', '<').replace('&gt;', '>')
                    clean = ' '.join(clean.split())
                    if clean and clean not in clean_values:
                        clean_values.append(clean)
                
                print(f"  Labels in page '{name}':")
                for cv in clean_values[:40]: # show first 40 labels
                    print(f"    - {cv}")
            else:
                print("  No content in diagram tag.")
    except Exception as e:
        print("Error parsing drawio file:", e)

parse_drawio_multi_pages('/home/thainv/workspace/sports-booking-platform/keintruc.drawio.png.xml')
