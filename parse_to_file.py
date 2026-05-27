import xml.etree.ElementTree as ET
import re
import urllib.parse

def parse_all_pages_to_file(xml_path, out_path):
    tree = ET.parse(xml_path)
    root = tree.getroot()
    diagrams = root.findall('.//diagram')
    
    with open(out_path, 'w', encoding='utf-8') as f:
        for idx, diagram in enumerate(diagrams):
            name = diagram.get('name')
            f.write(f"\n=========================================\n")
            f.write(f"DIAGRAM PAGE {idx+1}: {name}\n")
            f.write(f"=========================================\n")
            
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
                f.write(f"  - {cv}\n")

parse_all_pages_to_file('/home/thainv/workspace/sports-booking-platform/keintruc.drawio.png.xml', '/home/thainv/workspace/sports-booking-platform/baocao/diagram_labels.txt')
print("Successfully wrote labels to baocao/diagram_labels.txt")
