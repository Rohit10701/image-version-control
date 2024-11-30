import numpy as np
import cv2

def get_image_pixel_info(image_path):
    # Read the image using OpenCV
    image = cv2.imread(image_path)
    
    if image is None:
        raise ValueError("Image not found or unable to load")
    
    # Convert the pixel data to a string representation
    pixel_string = np.array2string(image, separator=', ')
    
    return pixel_string

# Example usage
image_path = './image.png'
pixel_info = get_image_pixel_info(image_path)
print(pixel_info)
