import Tags from '../shared/tag/Tags';

// TODO:
// Les metadata auront forcément une destination
//
type Metadata = {
  fullPath: string;
  tags: Tags;
  // Les
  // soit /ANNEE/MOIS soit /NONE + OLD_PATH
  destinationFolder: string;
  year?: number;
  month?: number;
  hasExif: boolean;
  newName: string;
  // A voir si on conserve ce type là
  // dateTimeOriginal: String;
  // DateTimeOriginal Exif
};

export default Metadata;
