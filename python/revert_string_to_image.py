import cv2
import numpy as np

with open('pixels_with_metadata.txt', 'r') as f:
    full_string = f.read()

metadata, pixel_string = full_string.split('|')

height, width, channels = map(int, metadata.split(','))

pixels = np.array([int(pixel_string[i:i+3]) for i in range(0, len(pixel_string), 3)])

pixels = pixels.reshape((height, width, channels))

pixels = np.clip(pixels, 0, 255).astype(np.uint8)

cv2.imwrite('reverted_image.jpg', pixels)

cv2.imshow('Reverted Image', pixels)
cv2.waitKey(0)
cv2.destroyAllWindows()


print("Reverted image saved as 'reverted_image.jpg'.")
