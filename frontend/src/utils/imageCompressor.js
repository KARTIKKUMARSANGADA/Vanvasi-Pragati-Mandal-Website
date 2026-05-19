/**
 * Asynchronously compresses an image file using HTML5 Canvas.
 * Proportionally resizes the image so it fits within the specified maxWidth and maxHeight bounds,
 * and encodes it as a JPEG blob with the given compression quality.
 * 
 * @param {File} file The original image file
 * @param {Object} options Compression configuration options
 * @param {number} options.maxWidth The maximum width bound (default: 1200)
 * @param {number} options.maxHeight The maximum height bound (default: 1200)
 * @param {number} options.quality JPEG quality from 0.0 to 1.0 (default: 0.8)
 * @returns {Promise<File>} A promise resolving to the optimized File object
 */
export const compressImage = (file, { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = {}) => {
  return new Promise((resolve) => {
    // Graceful fallback: return the original file if not an image
    if (!file || !file.type || !file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale factor
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas data to highly optimized JPEG blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            
            // Generate clean optimized filename with .jpg extension
            const baseName = file.name.replace(/\.[^/.]+$/, "");
            const compressedFile = new File([blob], `${baseName}_optimized.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        resolve(file);
      };
    };
    
    reader.onerror = () => {
      resolve(file);
    };
  });
};
