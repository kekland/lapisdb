import { Model } from 'lapisdb/dist/lapisdb/model/model';

export class Reference<T extends Model<T>> {
  id: string;

  constructor(id: string) {
    this.id = id
  }

  async get(): Promise<T> {
    return 
  }
}
