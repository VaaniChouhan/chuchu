import re

with open("src/components/ChuChuSVG.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# Replace fill="#FAF4EB" or fill="#FEFEFE" with fill="#2D1E18" fillRule="evenodd"
updated_code = re.sub(
    r'<path fill="[^"]+" opacity="1.000000" stroke="none"',
    '<path fill="#2D1E18" fillRule="evenodd" opacity="1.000000" stroke="none"',
    code
)

with open("src/components/ChuChuSVG.tsx", "w", encoding="utf-8") as f:
    f.write(updated_code)

print("Updated ChuChuSVG.tsx with fillRule='evenodd' and fill='#2D1E18'")
