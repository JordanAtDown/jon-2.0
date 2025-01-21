type FileMetadata = {
  name: string;
  fullPath: string;
  extension: string;
  [property: string]: unknown;
};

export default FileMetadata;
