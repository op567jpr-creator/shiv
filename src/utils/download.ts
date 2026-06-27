/**
 * Utility to download base64 data URL reliably by converting it into a Blob Object URL.
 * Bypasses iframe sandbox download policies in most browsers.
 */
export function downloadBase64File(base64Data: string, fileName: string) {
  try {
    if (!base64Data) return;
    
    // Split the header and the base64 content
    const parts = base64Data.split(';base64,');
    if (parts.length !== 2) {
      // Fallback for plain URL or unsupported formats
      const link = document.createElement('a');
      link.href = base64Data;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    
    const mimeType = parts[0].split(':')[1] || 'image/png';
    const binaryStr = atob(parts[1]);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up memory
    setTimeout(() => URL.revokeObjectURL(url), 300);
  } catch (err) {
    console.error('Failed to download base64 file:', err);
    // Ultimate fallback
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
