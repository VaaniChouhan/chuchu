import re

with open(r'd:\AI\ChuChu\chuchu\assets\images\chuchu_expression_sheet.svg', 'r', encoding='utf-8') as f:
    text = f.read()

start_idx = text.find('d="') + 3
end_idx = text.rfind('"')
d_content = text[start_idx:end_idx]
subpaths = d_content.split('\nM')

# Gather coordinates of all elements excluding huge frame/bgs
features = []
for idx, sp in enumerate(subpaths[2:]): # skip bg 1 & 2
    nums = [float(x) for x in re.findall(r'[-+]?\d*\.?\d+', sp)]
    if not nums: continue
    xs = nums[0::2]
    ys = nums[1::2]
    cx = (min(xs) + max(xs)) / 2
    cy = (min(ys) + max(ys)) / 2
    w = max(xs) - min(xs)
    h = max(ys) - min(ys)
    # Ignore giant bounding boxes spanning across cells
    if w < 1000 and h < 1000:
        features.append((idx+3, cx, cy, min(xs), max(xs), min(ys), max(ys), w, h))

print(f"Total isolated visual feature subpaths: {len(features)}")
# Cluster by Y coordinate (rows) first, then X coordinate (columns)
features.sort(key=lambda f: f[2]) # sort by Y

# Let's inspect distribution of Y centers
y_centers = [f[2] for f in features]
print("Y centers summary: min =", min(y_centers), "max =", max(y_centers))
# Print Y clusters
y_sorted = sorted(features, key=lambda f: f[2])
for f in y_sorted:
    print(f"Subpath {f[0]:3d}: Center=({f[1]:6.1f}, {f[2]:6.1f}) Size=({f[7]:5.1f}x{f[8]:5.1f}) Bounds=[X: {f[3]:.0f}-{f[4]:.0f}, Y: {f[5]:.0f}-{f[6]:.0f}]")
