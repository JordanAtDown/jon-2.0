/**
 * Dictionary of extensions for building glob patterns.
 *
 * Each key (category) is associated with a list or a set of extensions.
 */
const EXTENSIONS: Record<string, string[]> = {
  MP4: ['mp4'],
  MOV: ['mov'],
  RAW: ['arw', 'raw'],
  JPG: ['jpg', 'jpeg'],
  PNG: ['png'],
  VIDEO: ['mp4', 'mov', 'avi'],
  IMAGE: ['jpg', 'jpeg', 'png', 'gif'],
};

export default EXTENSIONS;
