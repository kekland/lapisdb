import { Exclude } from 'class-transformer';
import { Datastore } from '../datastore/datastore';

export interface IObjectMetadata {
  id: string;
  created?: number;
  updated?: number;
}

export class Model<T extends Model<T>> {
  public meta: IObjectMetadata;

  @Exclude({ toPlainOnly: true })
  private db: Datastore<any>;

  constructor(data?: { id?: string, db?: Datastore<T> }) {
    if (data != null) {
      this.meta = { id: data.id }
      this.db = data.db
    }
    else {
      this.meta = null
      this.db = null
    }
  }

  public setData(data: { id: string, db: Datastore<T> }) {
    this.meta = { id: data.id }
    this.db = data.db
  }

  public setCreatedTime(time: number) {
    if(this.meta == null) { return; }
    this.meta.created = time
  }

  public setUpdatedTime(time: number) {
    if(this.meta == null) { return; }
    this.meta.updated = time
  }

  public setDb(db: Datastore<T>) {
    this.db = db
  }
}
