import xml.etree.ElementTree as ET
import re
import urllib.parse

def parse_page_4(xml_path):
    tree = ET.parse(xml_path)
    root = tree.getroot()
    diagrams = root.findall('.//diagram')
    
    # We want Page-4 (index 3)
    diagram = diagrams[3]
    name = diagram.get('name')
    print(f"=== ELEMENTS IN PAGE {name} ===")
    
    mxcells = diagram.findall('.//mxCell')
    clean_values = []
    for cell in mxcells:
        val = cell.get('value', '')
        if val:
            # clean HTML tags
            clean = re.sub(r'<[^>]+>', ' ', val)
            clean = urllib.parse.unquote(clean)
            clean = clean.replace('&nbsp;', ' ').replace('&quot;', '"').replace('&#39;', "'").replace('&lt;', '<').replace('&gt;', '>')
            clean = ' '.join(clean.split())
            if clean and clean not in clean_values:
                clean_values.append(clean)
                
    for cv in clean_values:
        print(f"  - {cv}")

parse_page_4('/home/thainv/workspace/sports-booking-platform/keintruc.drawio.png.xml')
