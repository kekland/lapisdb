import { IFullfilledModelMetadata } from '../model/model.metadata';
import nanoid = require('nanoid');

class MetadataUtils {
  static getNewMetadata(): IFullfilledModelMetadata {
    return {id: nanoid(), created: }
  }
}