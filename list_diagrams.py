import xml.etree.ElementTree as ET

def find_diagrams(xml_path):
    tree = ET.parse(xml_path)
    root = tree.getroot()
    diagrams = root.findall('.//diagram')
    print(f"Total <diagram> elements found: {len(diagrams)}")
    for idx, diag in enumerate(diagrams):
        name = diag.get('name')
        id_ = diag.get('id')
        print(f"Diagram {idx+1}: name='{name}', id='{id_}', text_len={len(diag.text) if diag.text else 0}")

find_diagrams('/home/thainv/workspace/sports-booking-platform/keintruc.drawio.png.xml')
