from pathlib import Path
from PIL import Image
import colorsys
import numpy as np
import pandas as pd
from tqdm import tqdm
import shutil


# ============================
# SETTINGS
# ============================

IMAGE_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".webp", ".tiff", ".tif"
}

OUTPUT_PREFIX = "CURATED"

GROUPS = {
    "01_Bright_Neutral",
    "02_Warm_Earth",
    "03_Golden_Hour",
    "04_Greens",
    "05_Cyans",
    "06_Blues",
    "07_Purples_Pinks",
    "08_Night_Neon",
    "09_Monochrome",
    "10_Colourful"
}


# ============================
# IMAGE ANALYSIS
# ============================


def analyse_image(path):

    img = Image.open(path).convert("RGB")

    # smaller = faster
    img.thumbnail((300,300))

    pixels = np.array(img).reshape(-1,3) / 255.0

    brightness = np.mean(pixels)

    # contrast
    contrast = np.std(pixels)

    hsv_pixels = []

    for r,g,b in pixels:

        h,s,v = colorsys.rgb_to_hsv(r,g,b)

        hsv_pixels.append((h,s,v))

    hsv_pixels = np.array(hsv_pixels)


    # ignore almost grey pixels when finding colour
    colourful = hsv_pixels[hsv_pixels[:,1] > 0.15]

    if len(colourful) > 10:

        hues = colourful[:,0]

        # circular average hue
        hue_angle = np.mean(
            np.exp(2j*np.pi*hues)
        )

        hue = (
            np.angle(hue_angle)
            /(2*np.pi)
        ) % 1

        saturation = np.mean(
            colourful[:,1]
        )

    else:

        hue = 0
        saturation = 0


    # warmth score
    warmth = np.mean(
        pixels[:,0] - pixels[:,2]
    )


    # colourfulness
    colourfulness = np.std(
        pixels,
        axis=0
    ).mean()


    return {
        "brightness": brightness,
        "contrast": contrast,
        "hue": hue,
        "saturation": saturation,
        "warmth": warmth,
        "colourfulness": colourfulness
    }



# ============================
# AESTHETIC CLASSIFIER
# ============================


def classify(x):

    brightness = x["brightness"]
    saturation = x["saturation"]
    hue = x["hue"]
    warmth = x["warmth"]
    colourfulness = x["colourfulness"]


    degrees = hue * 360


    # almost no colour
    if saturation < 0.12:

        if brightness > 0.75:
            return "01_Bright_Neutral"

        else:
            return "09_Monochrome"


    # very dark images
    if brightness < 0.25:

        if saturation > 0.45:
            return "08_Night_Neon"

        else:
            return "09_Monochrome"


    # warm colours
    if degrees < 45:

        if brightness > 0.55:
            return "03_Golden_Hour"

        return "02_Warm_Earth"


    # oranges/yellows
    if degrees < 70:
        return "03_Golden_Hour"


    # greens
    if degrees < 160:
        return "04_Greens"


    # cyan
    if degrees < 200:
        return "05_Cyans"


    # blues
    if degrees < 260:
        return "06_Blues"


    # purple/pink
    if degrees < 340:
        return "07_Purples_Pinks"


    # highly colourful images
    if colourfulness > 0.18:
        return "10_Colourful"


    return "02_Warm_Earth"



# ============================
# MAIN
# ============================


folder = Path(".")

images = [
    p for p in folder.iterdir()
    if p.suffix.lower() in IMAGE_EXTENSIONS
]


if not images:
    print("No images found.")
    exit()


records = []


print("Analysing images...")

for img in tqdm(images):

    data = analyse_image(img)

    data["file"] = img.name

    data["group"] = classify(data)

    records.append(data)



df = pd.DataFrame(records)


# sort:
# darker first
# then saturation
# then warmth

df = df.sort_values(
    [
        "group",
        "brightness",
        "saturation",
        "warmth"
    ]
)



# ============================
# CREATE FOLDERS + MOVE
# ============================


print("Creating folders...")


for group in GROUPS:

    Path(group).mkdir(
        exist_ok=True
    )


print("Moving images...")


for _, row in tqdm(df.iterrows(),
                   total=len(df)):

    source = Path(row["file"])

    destination = (
        Path(row["group"])
        /
        source.name
    )


    # avoid collisions
    counter = 1

    while destination.exists():

        destination = (
            Path(row["group"])
            /
            f"{source.stem}_{counter}{source.suffix}"
        )

        counter += 1


    shutil.move(
        str(source),
        str(destination)
    )


# save report

df.to_csv(
    "colour_report.csv",
    index=False
)


print("\nFinished!")
print("Created:")
print("- 10 colour folders")
print("- colour_report.csv")
