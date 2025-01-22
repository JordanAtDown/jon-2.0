type FileMetadata = {
  name: string;
  fullPath: string;
  directory: string;
  extension: string;
  [property: string]: unknown;
};

export default FileMetadata;
