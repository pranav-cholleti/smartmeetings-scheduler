
/**
 * Utility function to download a file from a URL with a specified filename
 */
export const downloadFile = async (url: string, filename: string): Promise<boolean> => {
  try {
    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Append to the document
    document.body.appendChild(link);
    
    // Trigger click
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
};

/**
 * Extracts filename from Content-Disposition header
 */
export const getFilenameFromContentDisposition = (contentDisposition?: string): string | null => {
  if (!contentDisposition) return null;
  
  // Try to extract filename from Content-Disposition header
  const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
  const matches = filenameRegex.exec(contentDisposition);
  
  if (matches && matches[1]) {
    return matches[1].replace(/['"]/g, '');
  }
  
  return null;
};
