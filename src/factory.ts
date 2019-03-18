import { Datastore } from './database/datastore/datastore';
import { Model } from './database/model/model';

export class Factory<T extends Model<T>> {
  private type: any;
  private db: Datastore<T>
  constructor(type: () => any, db: Datastore<T>) {
    this.type = type()
    this.db = db
  }

  public create(data: T) {
    data.setDb(this.db)
    return data
  }
}
