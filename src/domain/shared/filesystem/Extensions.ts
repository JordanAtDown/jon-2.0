/**
 * Dictionary of extensions for building glob patterns.
 *
 * Each key (category) is associated with a list or a set of extensions.
 */
const EXTENSIONS: Record<string, string[]> = {
  MP4: ['mp4', 'MP4'],
  MOV: ['mov', 'MOV'],
  RAW: ['arw', 'raw', 'ARW', 'RAW'],
  JPG: ['jpg', 'jpeg', 'JPEG', 'JPG'],
  PNG: ['png'],
  VIDEO: ['mp4', 'MP4', 'mov', 'MOV', 'avi', 'AVI'],
  IMAGE: [
    'jpg',
    'JPG',
    'jpeg',
    'JPEG',
    'png',
    'PNG',
    'gif',
    'GIF',
    'BMP',
    'bmp',
  ],
};

export default EXTENSIONS;
