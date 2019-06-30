import { Datastore, Model } from '../..';
import { ClassType } from 'lapisdb';

export class DatastoreManager {
  private static datastores: Map<ClassType<any>, Datastore<any>> = new Map();

  public static register(datastore: Datastore<any>) {
    this.datastores.set(datastore.type, datastore)
  }

  public static get<T extends Model<T>>(type: ClassType<T>): Datastore<T> | undefined {
    return this.datastores.get(type)
  }

  public static initialize(...datastores: Array<Datastore<any>>) {
    datastores.forEach(DatastoreManager.register)
  }
}
