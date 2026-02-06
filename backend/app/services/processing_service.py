import cv2
import numpy as np
import base64

def segment_leaf(image_bytes):
    """
    Segments leaf from image using color masking and shape analysis.
    Returns: (masked_image_base64, leaf_area_percentage, is_leaf)
    """
    # Decode image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return None, 0, False

    # Convert to HSV
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # Define green color range (healthy leaf)
    lower_green = np.array([35, 40, 40])
    upper_green = np.array([90, 255, 255])
    
    # Define brown/yellow range (diseased areas)
    # Hue 10-35 covers orange/yellow/brown
    lower_brown = np.array([10, 50, 20])
    upper_brown = np.array([35, 255, 255])

    # Combine masks
    mask_green = cv2.inRange(hsv, lower_green, upper_green)
    mask_brown = cv2.inRange(hsv, lower_brown, upper_brown)
    mask = cv2.bitwise_or(mask_green, mask_brown)

    # Morphological operations to clean noise
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    # Find contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    final_mask = np.zeros_like(mask)
    valid_leaf_area = 0
    total_area = img.shape[0] * img.shape[1]

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 500: # Filter small noise
            continue
            
        # Shape Analysis
        perimeter = cv2.arcLength(cnt, True)
        if perimeter == 0: continue
        
        # Circularity: 4 * pi * Area / Perimeter^2
        circularity = 4 * np.pi * area / (perimeter * perimeter)
        
        # Solidity: Area / Convex Hull Area
        hull = cv2.convexHull(cnt)
        hull_area = cv2.contourArea(hull)
        solidity = float(area) / hull_area if hull_area > 0 else 0
        
        # Heuristic for leaf shape:
        # Leaves usually have circularity between 0.1 and 0.8 (not perfect circles)
        # And high solidity (> 0.5)
        if 0.05 < circularity < 0.9 and solidity > 0.4:
            cv2.drawContours(final_mask, [cnt], -1, 255, -1)
            valid_leaf_area += area

    # Apply mask to original image
    masked_img = cv2.bitwise_and(img, img, mask=final_mask)
    
    leaf_percentage = (valid_leaf_area / total_area) * 100
    is_leaf = leaf_percentage > 5 # Threshold to assume a leaf is present

    # Encode back to base64 for preview (optional) or just return result
    _, buffer = cv2.imencode('.jpg', masked_img)
    masked_base64 = base64.b64encode(buffer).decode('utf-8')

    return masked_base64, round(leaf_percentage, 2), is_leaf
