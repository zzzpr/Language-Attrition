import re

empty_sentence = "___"
empty_image = "questionmark"

# Process input lines to extract comments and image pairs
def process_lines(lines, num_fields, comment_func, image_func):
    lines_list = lines.strip().split('\n')
    comment_results = []
    image_results = []
    for line in lines_list:
        if not line.strip():
            continue
        # Extract quoted fields from each line
        matches = re.findall(r'\"(.*?)\"', line)
        if len(matches) >= num_fields:
            comment_results.append(comment_func(matches))
            image_results.append(image_func(matches))
    return comment_results, image_results

# Print formatted comments and image pairs for use in other scripts
def printInfo(comments, image_pairs):
    # Generate comments(Sentence)
    print("\t# Sentence:\n\tcomments = [")
    for (i, comment) in enumerate(comments):
        print(f"\t\t\"{comment}\",")
        if((i + 1) % 24 == 0):
            print()
    print("\t]")

    # Generate image pairs
    print("\t# Image pairs:\n\timage_pairs = [")
    for (i, (img1, img2)) in enumerate(image_pairs):
        print(f"\t\t(\"{img1}\", \"{img2}\"),")
        if((i + 1) % 24 == 0):
            print()
    print("\t]")
    print("\tgenerate_slides(image_pairs, comments)")

# Multiline string input
train_lines = """
 "artist_sing", "Somo pilka",   "artist_run", "Riko"
 "artist_sing", "Somo pilka",  "artist_jump", "Jato"
 "artist_sing", "Somo pilka", "artist_sleep", "Leno"
  "artist_run", "Riko pilka",  "artist_sing", "Somo"
  "artist_run", "Riko pilka",  "artist_jump", "Jato"
  "artist_run", "Riko pilka", "artist_sleep", "Leno"
 "artist_jump", "Jato pilka",  "artist_sing", "Somo"
 "artist_jump", "Jato pilka",   "artist_run", "Riko"
 "artist_jump", "Jato pilka", "artist_sleep", "Leno"
"artist_sleep", "Leno pilka",  "artist_sing", "Somo"
"artist_sleep", "Leno pilka",   "artist_run", "Riko"
"artist_sleep", "Leno pilka",  "artist_jump", "Jato"
 "pirate_sing", "Somo barsa",   "pirate_run", "Riko"
 "pirate_sing", "Somo barsa",  "pirate_jump", "Jato"
 "pirate_sing", "Somo barsa", "pirate_sleep", "Leno"
  "pirate_run", "Riko barsa",  "pirate_sing", "Somo"
  "pirate_run", "Riko barsa",  "pirate_jump", "Jato"
  "pirate_run", "Riko barsa", "pirate_sleep", "Leno"
 "pirate_jump", "Jato barsa",  "pirate_sing", "Somo"
 "pirate_jump", "Jato barsa",   "pirate_run", "Riko"
 "pirate_jump", "Jato barsa", "pirate_sleep", "Leno"
"pirate_sleep", "Leno barsa",  "pirate_sing", "Somo"
"pirate_sleep", "Leno barsa",   "pirate_run", "Riko"
"pirate_sleep", "Leno barsa",  "pirate_jump", "Jato"

 "artist_sing", "Somo pilka",   "artist_run", "Riko pilka"
 "artist_sing", "Somo pilka",  "artist_jump", "Jato pilka"
 "artist_sing", "Somo pilka", "artist_sleep", "Leno pilka"
  "artist_run", "Riko pilka",  "artist_sing", "Somo pilka"
  "artist_run", "Riko pilka",  "artist_jump", "Jato pilka"
  "artist_run", "Riko pilka", "artist_sleep", "Leno pilka"
 "artist_jump", "Jato pilka",  "artist_sing", "Somo pilka"
 "artist_jump", "Jato pilka",   "artist_run", "Riko pilka"
 "artist_jump", "Jato pilka", "artist_sleep", "Leno pilka"
"artist_sleep", "Leno pilka",  "artist_sing", "Somo pilka"
"artist_sleep", "Leno pilka",   "artist_run", "Riko pilka"
"artist_sleep", "Leno pilka",  "artist_jump", "Jato pilka"
 "pirate_sing", "Somo barsa",   "pirate_run", "Riko barsa"
 "pirate_sing", "Somo barsa",  "pirate_jump", "Jato barsa"
 "pirate_sing", "Somo barsa", "pirate_sleep", "Leno barsa"
  "pirate_run", "Riko barsa",  "pirate_sing", "Somo barsa"
  "pirate_run", "Riko barsa",  "pirate_jump", "Jato barsa"
  "pirate_run", "Riko barsa", "pirate_sleep", "Leno barsa"
 "pirate_jump", "Jato barsa",  "pirate_sing", "Somo barsa"
 "pirate_jump", "Jato barsa",   "pirate_run", "Riko barsa"
 "pirate_jump", "Jato barsa", "pirate_sleep", "Leno barsa"
"pirate_sleep", "Leno barsa",  "pirate_sing", "Somo barsa"
"pirate_sleep", "Leno barsa",   "pirate_run", "Riko barsa"
"pirate_sleep", "Leno barsa",  "pirate_jump", "Jato barsa"

 "artist_sing", "Somo pilka",   "pirate_run", "Riko"
 "artist_sing", "Somo pilka",  "pirate_jump", "Jato"
 "artist_sing", "Somo pilka", "pirate_sleep", "Leno"
  "artist_run", "Riko pilka",  "pirate_sing", "Somo"
  "artist_run", "Riko pilka",  "pirate_jump", "Jato"
  "artist_run", "Riko pilka", "pirate_sleep", "Leno"
 "artist_jump", "Jato pilka",  "pirate_sing", "Somo"
 "artist_jump", "Jato pilka",   "pirate_run", "Riko"
 "artist_jump", "Jato pilka", "pirate_sleep", "Leno"
"artist_sleep", "Leno pilka",  "pirate_sing", "Somo"
"artist_sleep", "Leno pilka",   "pirate_run", "Riko"
"artist_sleep", "Leno pilka",  "pirate_jump", "Jato"
 "pirate_sing", "Somo barsa",   "artist_run", "Riko"
 "pirate_sing", "Somo barsa",  "artist_jump", "Jato"
 "pirate_sing", "Somo barsa", "artist_sleep", "Leno"
  "pirate_run", "Riko barsa",  "artist_sing", "Somo"
  "pirate_run", "Riko barsa",  "artist_jump", "Jato"
  "pirate_run", "Riko barsa", "artist_sleep", "Leno"
 "pirate_jump", "Jato barsa",  "artist_sing", "Somo"
 "pirate_jump", "Jato barsa",   "artist_run", "Riko"
 "pirate_jump", "Jato barsa", "artist_sleep", "Leno"
"pirate_sleep", "Leno barsa",  "artist_sing", "Somo"
"pirate_sleep", "Leno barsa",   "artist_run", "Riko"
"pirate_sleep", "Leno barsa",  "artist_jump", "Jato"

 "artist_sing", "Somo pilka",   "pirate_run", "Riko barsa"
 "artist_sing", "Somo pilka",  "pirate_jump", "Jato barsa"
 "artist_sing", "Somo pilka", "pirate_sleep", "Leno barsa"
  "artist_run", "Riko pilka",  "pirate_sing", "Somo barsa"
  "artist_run", "Riko pilka",  "pirate_jump", "Jato barsa"
  "artist_run", "Riko pilka", "pirate_sleep", "Leno barsa"
 "artist_jump", "Jato pilka",  "pirate_sing", "Somo barsa"
 "artist_jump", "Jato pilka",   "pirate_run", "Riko barsa"
 "artist_jump", "Jato pilka", "pirate_sleep", "Leno barsa"
"artist_sleep", "Leno pilka",  "pirate_sing", "Somo barsa"
"artist_sleep", "Leno pilka",   "pirate_run", "Riko barsa"
"artist_sleep", "Leno pilka",  "pirate_jump", "Jato barsa"
 "pirate_sing", "Somo barsa",   "artist_run", "Riko pilka"
 "pirate_sing", "Somo barsa",  "artist_jump", "Jato pilka"
 "pirate_sing", "Somo barsa", "artist_sleep", "Leno pilka"
  "pirate_run", "Riko barsa",  "artist_sing", "Somo pilka"
  "pirate_run", "Riko barsa",  "artist_jump", "Jato pilka"
  "pirate_run", "Riko barsa", "artist_sleep", "Leno pilka"
 "pirate_jump", "Jato barsa",  "artist_sing", "Somo pilka"
 "pirate_jump", "Jato barsa",   "artist_run", "Riko pilka"
 "pirate_jump", "Jato barsa", "artist_sleep", "Leno pilka"
"pirate_sleep", "Leno barsa",  "artist_sing", "Somo pilka"
"pirate_sleep", "Leno barsa",   "artist_run", "Riko pilka"
"pirate_sleep", "Leno barsa",  "artist_jump", "Jato pilka"
"""

testS_lines = """
  "artist_run",  "artist_sing", "Riko pilka",
 "artist_jump",  "artist_sing", "Jato pilka",
"artist_sleep",  "artist_sing", "Leno pilka",
 "artist_sing",   "artist_run", "Somo pilka",
 "artist_jump",   "artist_run", "Jato pilka",
"artist_sleep",   "artist_run", "Leno pilka",
 "artist_sing",  "artist_jump", "Somo pilka",
  "artist_run",  "artist_jump", "Riko pilka",
"artist_sleep",  "artist_jump", "Leno pilka",
 "artist_sing", "artist_sleep", "Somo pilka",
  "artist_run", "artist_sleep", "Riko pilka",
 "artist_jump", "artist_sleep", "Jato pilka",
  "pirate_run",  "pirate_sing", "Riko barsa",
 "pirate_jump",  "pirate_sing", "Jato barsa",
"pirate_sleep",  "pirate_sing", "Leno barsa",
 "pirate_sing",   "pirate_run", "Somo barsa",
 "pirate_jump",   "pirate_run", "Jato barsa",
"pirate_sleep",   "pirate_run", "Leno barsa",
 "pirate_sing",  "pirate_jump", "Somo barsa",
  "pirate_run",  "pirate_jump", "Riko barsa",
"pirate_sleep",  "pirate_jump", "Leno barsa",
 "pirate_sing", "pirate_sleep", "Somo barsa",
  "pirate_run", "pirate_sleep", "Riko barsa",
 "pirate_jump", "pirate_sleep", "Jato barsa",
                                             
  "pirate_run",  "artist_sing", "Riko barsa",
 "pirate_jump",  "artist_sing", "Jato barsa",
"pirate_sleep",  "artist_sing", "Leno barsa",
 "pirate_sing",   "artist_run", "Somo barsa",
 "pirate_jump",   "artist_run", "Jato barsa",
"pirate_sleep",   "artist_run", "Leno barsa",
 "pirate_sing",  "artist_jump", "Somo barsa",
  "pirate_run",  "artist_jump", "Riko barsa",
"pirate_sleep",  "artist_jump", "Leno barsa",
 "pirate_sing", "artist_sleep", "Somo barsa",
  "pirate_run", "artist_sleep", "Riko barsa",
 "pirate_jump", "artist_sleep", "Jato barsa",
  "artist_run",  "pirate_sing", "Riko pilka",
 "artist_jump",  "pirate_sing", "Jato pilka",
"artist_sleep",  "pirate_sing", "Leno pilka",
 "artist_sing",   "pirate_run", "Somo pilka",
 "artist_jump",   "pirate_run", "Jato pilka",
"artist_sleep",   "pirate_run", "Leno pilka",
 "artist_sing",  "pirate_jump", "Somo pilka",
  "artist_run",  "pirate_jump", "Riko pilka",
"artist_sleep",  "pirate_jump", "Leno pilka",
 "artist_sing", "pirate_sleep", "Somo pilka",
  "artist_run", "pirate_sleep", "Riko pilka",
 "artist_jump", "pirate_sleep", "Jato pilka",
"""

testI_lines = """
 "artist_jump", "Somo pilka", "Jato pilka",
"artist_sleep", "Somo pilka", "Leno pilka",
 "artist_sing", "Riko pilka", "Somo pilka",
 "artist_jump", "Riko pilka", "Jato pilka",
"artist_sleep", "Riko pilka", "Leno pilka",
 "artist_sing", "Jato pilka", "Somo pilka",
  "artist_run", "Jato pilka", "Riko pilka",
"artist_sleep", "Jato pilka", "Leno pilka",
 "artist_sing", "Leno pilka", "Somo pilka",
  "artist_run", "Leno pilka", "Riko pilka",
  "artist_run", "Somo pilka", "Riko pilka",
 "artist_jump", "Leno pilka", "Jato pilka",
  "pirate_run", "Somo barsa", "Riko barsa",
 "pirate_jump", "Somo barsa", "Jato barsa",
"pirate_sleep", "Somo barsa", "Leno barsa",
 "pirate_sing", "Riko barsa", "Somo barsa",
 "pirate_jump", "Riko barsa", "Jato barsa",
"pirate_sleep", "Riko barsa", "Leno barsa",
 "pirate_sing", "Jato barsa", "Somo barsa",
  "pirate_run", "Jato barsa", "Riko barsa",
"pirate_sleep", "Jato barsa", "Leno barsa",
 "pirate_sing", "Leno barsa", "Somo barsa",
  "pirate_run", "Leno barsa", "Riko barsa",
 "pirate_jump", "Leno barsa", "Jato barsa",

  "artist_run", "Somo", "Riko pilka",
 "artist_jump", "Somo", "Jato pilka",
"artist_sleep", "Somo", "Leno pilka",
 "artist_sing", "Riko", "Somo pilka",
 "artist_jump", "Riko", "Jato pilka",
"artist_sleep", "Riko", "Leno pilka",
 "artist_sing", "Jato", "Somo pilka",
  "artist_run", "Jato", "Riko pilka",
"artist_sleep", "Jato", "Leno pilka",
 "artist_sing", "Leno", "Somo pilka",
  "artist_run", "Leno", "Riko pilka",
 "artist_jump", "Leno", "Jato pilka",
  "pirate_run", "Somo", "Riko barsa",
 "pirate_jump", "Somo", "Jato barsa",
"pirate_sleep", "Somo", "Leno barsa",
 "pirate_sing", "Riko", "Somo barsa",
 "pirate_jump", "Riko", "Jato barsa",
"pirate_sleep", "Riko", "Leno barsa",
 "pirate_sing", "Jato", "Somo barsa",
  "pirate_run", "Jato", "Riko barsa",
"pirate_sleep", "Jato", "Leno barsa",
 "pirate_sing", "Leno", "Somo barsa",
  "pirate_run", "Leno", "Riko barsa",
 "pirate_jump", "Leno", "Jato barsa",

  "pirate_run", "Somo pilka", "Riko barsa",
 "pirate_jump", "Somo pilka", "Jato barsa",
"pirate_sleep", "Somo pilka", "Leno barsa",
 "pirate_sing", "Riko pilka", "Somo barsa",
 "pirate_jump", "Riko pilka", "Jato barsa",
"pirate_sleep", "Riko pilka", "Leno barsa",
 "pirate_sing", "Jato pilka", "Somo barsa",
  "pirate_run", "Jato pilka", "Riko barsa",
"pirate_sleep", "Jato pilka", "Leno barsa",
 "pirate_sing", "Leno pilka", "Somo barsa",
  "pirate_run", "Leno pilka", "Riko barsa",
 "pirate_jump", "Leno pilka", "Jato barsa",
  "artist_run", "Somo barsa", "Riko pilka",
 "artist_jump", "Somo barsa", "Jato pilka",
"artist_sleep", "Somo barsa", "Leno pilka",
 "artist_sing", "Riko barsa", "Somo pilka",
 "artist_jump", "Riko barsa", "Jato pilka",
"artist_sleep", "Riko barsa", "Leno pilka",
 "artist_sing", "Jato barsa", "Somo pilka",
  "artist_run", "Jato barsa", "Riko pilka",
"artist_sleep", "Jato barsa", "Leno pilka",
 "artist_sing", "Leno barsa", "Somo pilka",
  "artist_run", "Leno barsa", "Riko pilka",
 "artist_jump", "Leno barsa", "Jato pilka",

  "artist_run", "Somo", "Riko pilka",
 "artist_jump", "Somo", "Jato pilka",
"artist_sleep", "Somo", "Leno pilka",
 "artist_sing", "Riko", "Somo pilka",
 "artist_jump", "Riko", "Jato pilka",
"artist_sleep", "Riko", "Leno pilka",
 "artist_sing", "Jato", "Somo pilka",
  "artist_run", "Jato", "Riko pilka",
"artist_sleep", "Jato", "Leno pilka",
 "artist_sing", "Leno", "Somo pilka",
  "artist_run", "Leno", "Riko pilka",
 "artist_jump", "Leno", "Jato pilka",
  "pirate_run", "Somo", "Riko barsa",
 "pirate_jump", "Somo", "Jato barsa",
"pirate_sleep", "Somo", "Leno barsa",
 "pirate_sing", "Riko", "Somo barsa",
 "pirate_jump", "Riko", "Jato barsa",
"pirate_sleep", "Riko", "Leno barsa",
 "pirate_sing", "Jato", "Somo barsa",
  "pirate_run", "Jato", "Riko barsa",
"pirate_sleep", "Jato", "Leno barsa",
 "pirate_sing", "Leno", "Somo barsa",
  "pirate_run", "Leno", "Riko barsa",
 "pirate_jump", "Leno", "Jato barsa",
"""

# Process training data: extract comments and image pairs
comments, images = process_lines(
    train_lines,
    4,
    lambda m: f"{m[1]}, {m[3][0].lower()}{m[3][1:]}.",
    lambda m: (f"{m[0]}.jpg", f"{m[2]}.jpg")
)

# Process testS(Sentence) data: extract comments and image pairs
comments_testS, images_testS = process_lines(
    testS_lines,
    3,
    lambda m: f"{m[2]}, {empty_sentence}.",
    lambda m: (f"{m[0]}.jpg", f"{m[1]}.jpg")
)

# Process testI(Image) data: extract comments and image pairs
comments_testI, images_testI = process_lines(
    testI_lines,
    3,
    lambda m: f"{m[2]}, {m[1][0].lower()}{m[1][1:]}.",
    lambda m: (f"{m[0]}.jpg", f"{empty_image}.jpg")
)

# Generate empty comments for testSS (96 test items with no sentence, only images)
comments_empty = ["0"] * 96
images_testSS = [(pair[0], "questionmark.jpg") for pair in images_testS]

# Print all processed comments and image pairs
printInfo(comments + comments_testS + comments_testI + comments_empty,
          images + images_testS + images_testI + images_testS + images_testSS)