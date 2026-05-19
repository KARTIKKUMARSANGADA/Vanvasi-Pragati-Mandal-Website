import io
from PIL import Image
from fastapi import UploadFile
import logging

logger = logging.getLogger(__name__)

async def compress_image(image_file: UploadFile, max_size=(1200, 1200), quality=80) -> bytes:
    """
    Compresses an image from an UploadFile object.
    Returns the compressed image bytes.
    """
    # Read image content
    content = await image_file.read()
    
    # Open image using Pillow
    img = Image.open(io.BytesIO(content))
    
    # Convert to RGB if necessary (e.g., for PNG with transparency)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    
    # Resize image if it's larger than max_size
    img.thumbnail(max_size, Image.Resampling.LANCZOS)
    
    # Save compressed image to a BytesIO object
    output = io.BytesIO()
    img.save(output, format="JPEG", quality=quality, optimize=True)
    
    # Reset file pointer for the UploadFile just in case it's used elsewhere
    await image_file.seek(0)
    
    return output.getvalue()

def compress_image_bytes(content: bytes, max_size=(1200, 1200), quality=80) -> bytes:
    """
    Compresses image bytes.
    Returns the compressed image bytes.
    """
    img = Image.open(io.BytesIO(content))
    
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    
    img.thumbnail(max_size, Image.Resampling.LANCZOS)
    
    output = io.BytesIO()
    img.save(output, format="JPEG", quality=quality, optimize=True)
    
    return output.getvalue()
