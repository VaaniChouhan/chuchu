import re

with open("assets/images/chuchu_expression_sheet.svg", "r", encoding="utf-8") as f:
    svg_data = f.read()

d_match = re.search(r'd="([^"]+)"', svg_data)
if d_match:
    d = d_match.group(1)
    # Split d attribute by 'M' to get each individual subpath
    subpaths = ["M" + p for p in d.split("M") if p.strip()]
    print(f"Total subpaths: {len(subpaths)}")
    
    for i, sp in enumerate(subpaths):
        # Extract all numbers from subpath to find bounding box
        coords = [float(x) for x in re.findall(r'[-+]?\d*\.\d+|\d+', sp)]
        if len(coords) >= 4:
            xs = coords[0::2]
            ys = coords[1::2]
            if xs and ys:
                min_x, max_x = min(xs), max(xs)
                min_y, max_y = min(ys), max(ys)
                width = max_x - min_x
                height = max_y - min_y
                print(f"Subpath {i}: bounds=[X: {min_x:.1f}-{max_x:.1f}, Y: {min_y:.1f}-{max_y:.1f}], size={width:.1f}x{height:.1f}")
