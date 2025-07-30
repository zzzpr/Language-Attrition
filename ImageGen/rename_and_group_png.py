import os

dir_images = os.path.join(os.path.dirname(__file__), "new_presentation") + os.sep

# Get all PNG files in the directory (with .PNG extension)
files = [f for f in os.listdir(dir_images) if f.endswith('.PNG')]

# Define renaming groups: (start index, end index, prefix)
groups = [
    (0, 96, "0"),   # First 96 files: 0xx.png
    (96, 144, "1"), # Next 48 files: 1xx.png
    (144, 240, "2"),# Next 96 files: 2xx.png
    (240, 288, "3"),# Next 48 files: 3xx.png
    (288, 336, "4") # Last 48 files: 4xx.png
]

for idx, filename in enumerate(files):
    # Change extension to lowercase .png
    name, ext = os.path.splitext(filename)
    ext = '.png'
    # Determine the new file name based on the group
    for start, end, prefix in groups:
        if start <= idx < end:
            num = idx - start + 1  # Start numbering from 1
            new_name = f"{prefix}{num:02d}{ext}"
            break
    else:
        # Skip files outside the defined groups
        continue
    old_path = os.path.join(dir_images, filename)
    new_path = os.path.join(dir_images, new_name)
    os.rename(old_path, new_path)