const sharp = require('sharp');

const getFileType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('application/pdf') || mimeType.startsWith('text/')) return 'document';
  return 'other';
};

const getImageDimensions = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    return `${metadata.width} x ${metadata.height}`;
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return null;
  }
};

module.exports = {
  getFileType,
  getImageDimensions
};
