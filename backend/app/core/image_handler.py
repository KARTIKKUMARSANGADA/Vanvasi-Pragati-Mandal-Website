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

def verify_image_magic_bytes(content: bytes) -> bool:
    """
    Checks the first few bytes of the file to ensure it matches standard image signatures.
    """
    if len(content) < 4:
        return False
    # JPEG: FF D8 FF
    if content.startswith(b"\xff\xd8\xff"):
        return True
    # PNG: 89 50 4E 47
    if content.startswith(b"\x89PNG"):
        return True
    # GIF: GIF87a or GIF89a
    if content.startswith(b"GIF87a") or content.startswith(b"GIF89a"):
        return True
    # WebP: RIFF ... WEBP
    if content.startswith(b"RIFF") and b"WEBP" in content[8:14]:
        return True
    return False

async def validate_image_file(image_file: UploadFile):
    """
    Reads the beginning of the uploaded file to verify it's a valid image.
    Throws ValueError if verification fails.
    """
    content = await image_file.read()
    await image_file.seek(0)
    if not verify_image_magic_bytes(content):
        raise ValueError(f"Invalid file signature on '{image_file.filename}': uploaded file is not a supported image type.")
