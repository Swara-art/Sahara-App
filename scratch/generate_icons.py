from PIL import Image, ImageDraw

def create_icon(size, filename):
    img = Image.new('RGB', (size, size), color='#000000')
    d = ImageDraw.Draw(img)
    
    # Draw a simple gradient-like or solid purple circle
    margin = int(size * 0.1)
    d.ellipse([margin, margin, size-margin, size-margin], fill='#7c3aed')
    
    # Draw a smaller pink circle
    margin2 = int(size * 0.3)
    d.ellipse([margin2, margin2, size-margin2, size-margin2], fill='#ec4899')
    
    img.save(filename)
    print(f"Saved {filename}")

create_icon(192, "frontend/public/pwa-192x192.png")
create_icon(512, "frontend/public/pwa-512x512.png")
create_icon(180, "frontend/public/apple-touch-icon.png")
