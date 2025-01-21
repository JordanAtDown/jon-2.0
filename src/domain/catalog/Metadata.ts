import Tags from '../shared/tag/Tags';

type Metadata = {
  fullPath: string;
  tags: Tags;
  // soit /ANNEE/MOIS soit /NONE + OLD_PATH
  destinationFolder: string;
  year?: number;
  month?: number;
  hasExif: boolean;
  newName: string;
  // DateTimeOriginal Exif
};

export default Metadata;
