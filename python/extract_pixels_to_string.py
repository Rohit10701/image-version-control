import cv2
import numpy as np

image = cv2.imread('./image copy.png')

height, width, channels = image.shape

flattened = image.flatten()
pixel_string = ''.join([f'{pixel:03}' for pixel in flattened])  
metadata = f"{height},{width},{channels}"

full_string = metadata + "|" + pixel_string

with open('pixels_with_metadata.txt', 'w') as f:
    f.write(full_string)

print("Pixel string with metadata saved to 'pixels_with_metadata.txt'.")
