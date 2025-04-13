
export const applyWatermark = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      // For non-image files like PDFs, we would need more complex handling
      // For now, we'll just return a placeholder that indicates watermarking would happen
      resolve('/lovable-uploads/c396cd61-c7de-47be-b58c-edff18e58dbf.png');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Create canvas and draw the original image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not create canvas context'));
            return;
          }

          // Set canvas size to image dimensions
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw original image
          ctx.drawImage(img, 0, 0);
          
          // Add watermark
          ctx.globalAlpha = 0.3; // Transparency
          ctx.font = `${Math.max(20, img.width / 15)}px Inter, sans-serif`;
          ctx.fillStyle = '#4CAF50';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Angle the text
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(-Math.PI / 6); // Rotate about -30 degrees
          ctx.fillText('CogswellShare', 0, 0);
          ctx.restore();
          
          // Convert to data URL or blob URL
          const watermarkedImage = canvas.toDataURL(file.type);
          resolve(watermarkedImage);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Could not load image'));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Could not read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

export const getFilePreviewUrl = async (file: File): Promise<string> => {
  if (file.type.startsWith('image/')) {
    return URL.createObjectURL(file);
  }
  
  // For PDF, we could use a PDF icon or first page preview
  if (file.type === 'application/pdf') {
    return '/placeholder.svg'; // Replace with actual PDF icon
  }
  
  return '/placeholder.svg'; // Generic placeholder
};
