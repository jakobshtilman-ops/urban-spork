import struct
import zlib
import os

def create_png(width, height, r, g, b, output_path):
    # Generates a solid colored rounded icon with an inner white checklist motif
    raw_data = bytearray()
    
    center_x = width / 2
    center_y = height / 2
    corner_radius = width * 0.22
    
    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        for x in range(width):
            # Check rounded corner
            dx = max(0, abs(x - center_x) - (center_x - corner_radius))
            dy = max(0, abs(y - center_y) - (center_y - corner_radius))
            is_outside = (dx * dx + dy * dy) > (corner_radius * corner_radius)
            
            if is_outside:
                # Transparent outside rounded rect
                raw_data.extend([0, 0, 0, 0])
            else:
                # Inside icon: Indigo gradient with white check elements
                # Check if in inner white card: 20% to 80%
                in_inner_card = (0.22 * width <= x <= 0.78 * width) and (0.22 * height <= y <= 0.78 * height)
                
                # Check marks and bars inside the card
                in_check_1 = (0.30 * width <= x <= 0.38 * width) and (0.32 * height <= y <= 0.40 * height)
                in_bar_1 = (0.42 * width <= x <= 0.70 * width) and (0.34 * height <= y <= 0.38 * height)
                
                in_check_2 = (0.30 * width <= x <= 0.38 * width) and (0.46 * height <= y <= 0.54 * height)
                in_bar_2 = (0.42 * width <= x <= 0.70 * width) and (0.48 * height <= y <= 0.52 * height)
                
                in_check_3 = (0.30 * width <= x <= 0.38 * width) and (0.60 * height <= y <= 0.68 * height)
                in_bar_3 = (0.42 * width <= x <= 0.62 * width) and (0.62 * height <= y <= 0.66 * height)
                
                if in_check_1 or in_check_2:
                    # Emerald green check
                    raw_data.extend([16, 185, 129, 255])
                elif in_bar_1:
                    # Indigo bar
                    raw_data.extend([79, 70, 229, 255])
                elif in_bar_2:
                    # Lighter indigo bar
                    raw_data.extend([99, 102, 241, 255])
                elif in_check_3:
                    # Gray checkbox outline
                    border = (x == int(0.30*width) or x == int(0.38*width) or y == int(0.60*height) or y == int(0.68*height))
                    if border:
                        raw_data.extend([148, 163, 184, 255])
                    else:
                        raw_data.extend([241, 245, 249, 255])
                elif in_bar_3:
                    raw_data.extend([148, 163, 184, 255])
                elif in_inner_card:
                    # Clean white card background
                    raw_data.extend([255, 255, 255, 255])
                else:
                    # Indigo base
                    tint = int(20 * (y / height))
                    raw_data.extend([max(0, r - tint), max(0, g - tint), b, 255])

    # PNG chunks
    header = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr = b'IHDR' + ihdr_data
    ihdr_crc = struct.pack('>I', zlib.crc32(ihdr))
    ihdr_chunk = struct.pack('>I', len(ihdr_data)) + ihdr + ihdr_crc

    compressed = zlib.compress(bytes(raw_data), 9)
    idat = b'IDAT' + compressed
    idat_crc = struct.pack('>I', zlib.crc32(idat))
    idat_chunk = struct.pack('>I', len(compressed)) + idat + idat_crc

    iend = b'IEND'
    iend_crc = struct.pack('>I', zlib.crc32(iend))
    iend_chunk = struct.pack('>I', 0) + iend + iend_crc

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'wb') as f:
        f.write(header + ihdr_chunk + idat_chunk + iend_chunk)

create_png(192, 192, 79, 70, 229, 'public/pwa-192x192.png')
create_png(512, 512, 79, 70, 229, 'public/pwa-512x512.png')
create_png(512, 512, 79, 70, 229, 'public/pwa-maskable-512x512.png')
create_png(180, 180, 79, 70, 229, 'public/apple-touch-icon.png')
print("Successfully generated all PWA icons in public/")
