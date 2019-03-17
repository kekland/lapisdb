import { Datastore } from './datastore';
import { Exclude } from 'class-transformer';

export class Model<T extends Model<T>> {
  @Exclude({toPlainOnly: true})
  public id: string;

  @Exclude({toPlainOnly: true})
  private db: Datastore<any>;

  constructor(data?: {id?: string, db?: Datastore<T>}) {
    if (data != null) {
      this.id = data.id
      this.db = data.db
    }
    else {
      this.id = null
      this.db = null
    }
  }

  public setData(data: {id: string, db: Datastore<T>}) {
    this.id = data.id
    this.db = data.db
  }

  public setDb(db: Datastore<T>) {
    this.db = db
  }
}
