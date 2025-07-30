import os
import re
from PIL import Image

dir_images = os.path.join(os.path.dirname(__file__), "new_presentation") + os.sep
dir_dst = os.path.join(os.path.dirname(__file__), "ImageGen", "attrition_images") + os.sep

if not os.path.exists(dir_dst):
    os.makedirs(dir_dst)

# Regex pattern to match all png files with three digits in the filename (e.g., 001.png)
pattern = re.compile(r"(\d{3})\.png$", re.IGNORECASE)

for filename in os.listdir(dir_images):
    match = pattern.match(filename)
    if match:
        num = int(match.group(1))
        old_path = os.path.join(dir_images, filename)
        new_path = os.path.join(dir_dst, filename)
        try:
            with Image.open(old_path) as img:
                width, height = img.size
                # Crop 1/10 from the top, 1/15 from the left and right sides
                left = int(width / 15)
                right = width - int(width / 15)
                top = int(height / 10)
                # Crop ratio for the bottom depends on the file number
                # For 0xx, 1xx, 2xx (training and test with sentences), crop 1/10 from the bottom
                # For 3xx and 4xx (interactive images, no sentence), crop 1/5 from the bottom for more cropping
                if 0 <= num < 300:
                    bottom = height - int(height / 10)
                else:
                    bottom = height - int(height / 5)
                img_cropped = img.crop((left, top, right, bottom))
                img_cropped.save(new_path)
        except Exception as e:
            print(f"Error processing {filename}: {e}")