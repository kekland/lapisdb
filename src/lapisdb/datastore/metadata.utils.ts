import { IFilledModelMetadata } from '../model/model.metadata';
import nanoid = require('nanoid');

export class MetadataUtils {
  static getTimestamp(): number {
    return Date.now()
  }

  static getNewMetadata(): IFilledModelMetadata {
    const timestamp = MetadataUtils.getTimestamp()
    return { id: nanoid(), created: timestamp, updated: timestamp }
  }
}
