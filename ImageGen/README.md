# ImageGen

This is a small-scale image generation project designed to automatically produce 336 images required by the following files in the external directory:

- trial_d.js
- server\attrition_interaction_server.py

## Image Copyright Notice

### ​Attribution & Usage​
All JPEG files in attrition_images/ are provided as-is with the following specifications:

​No Copyright Claim: The author does not hold copyright for these images.

- Original Properties:
  - Preserved exact dimensions (no resizing)
  - Retained source filenames (no modifications)

All files in this directory serve as ​project source assets​.

### Custom Images
> If you create new images, you may need to manually adjust the cropping ratios in ​**crop_images_batch.py**.

## Preparation work​

These steps are already completed; no action required from you.

1. ​Extract Image Data from trial_d.js​

- In VS Code, use multi-line editing (Shift+Alt + mouse drag) to select all training/testing-related image information like: 
  ```javascript
  "artist_sing", "Somo pilka", "artist_run", "Riko"
  ```

2. ​Populate gen_ppt_data.py

- Paste the extracted(These are all multi-line string variables):
  - Training data into **train_lines**
  - Sentence test data into **testS_lines**
  - Image test data into **testI_lines**

## How to run?

1. Generate PPT Data​

- Run gen_ppt_data.py

  ```python
  python3 gen_ppt_data.py 
  ```
  Or you can copy content from tmp.log (not terminal) for cleaner output:
  ```python
  python3 gen_ppt_data.py > tmp.log
  ```
- Copy ALL output content and paste it into the **main block** of gen_ppt_slide.py
​
2. Create PowerPoint Slides​

- Run gen_ppt_slide.py to generate **new_presentation.pptx**(Each slide contains exactly one image):
  ```python
  python3 gen_ppt_slide.py 
  ```
- Verify all images are correct in the PPT file
​
3. Export PNGs​

- Save the presentation as **PNG** images to **project root** (will generate 336 images).
After the generation process is complete, the final directory structure should look like this:
​
  ```markdown
  ├── ImageGen/                   
  │   ├── new_presentation/       # Raw exported PNGs from PowerPoint
  │   ├── new_presentation.pptx   # PPT file
  │   ├── crop_images_batch.py    # Image cropping script
  │   ├── gen_ppt_data.py         # Data generation script
  │   ├── gen_ppt_slide.py        # PPT creation script
  │   ├── rename_and_group_png.py # Image renaming script
  │   ├── README.md               # Project documentation
  │   └── tmp.log                 # Auto-generated log file
  │
  └── attrition_images/          # Core image directory
  ```

4. Rename Images​

- Run rename_and_group_png.py to apply naming conventions:

    | Range  | Type            | Naming  |
    |--------|-----------------|---------|
    | 0-95   | Training        | 001-096 |
    | 96-143 | Sentence Test   | 101-148 |
    | 144-239| Image Test      | 201-296 |
    | 240-287| Interactive Test| 301-348 |
    | 288-335| Interactive Test| 401-448 |
  ```python
  python3 rename_and_group_png.py 
  ```
5. ​Batch Crop Images​
- Run crop_images_batch.py to:
  - Crop all images for web compatibility
  - Output processed images to **attrition_images** directory (the image library used in code)
  ```python
  python3 crop_images_batch.py 
  ```
**Note**: The final auto-generated images will be located in the **attrition_images** directory.