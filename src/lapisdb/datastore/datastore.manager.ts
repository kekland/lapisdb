import { Datastore, Model } from '../..';
import { ClassType } from '../..';

export class DatastoreManager {
  private static datastores: Map<ClassType<any>, Datastore<any>> = new Map();

  public static register(datastore: Datastore<any>) {
    DatastoreManager.datastores.set(datastore.type, datastore)
  }

  public static get<T extends Model<T>>(type: ClassType<T>): Datastore<T> {
    const store = DatastoreManager.datastores.get(type)
    if (!store) {
      throw new Error(`Datastore with type ${type} was not found. Perhaps you forgot to call DatastoreManager.register()?`)
    }
    return store
  }

  public static initialize(...datastores: Array<Datastore<any>>) {
    DatastoreManager.datastores = new Map<ClassType<any>, Datastore<any>>()
    datastores.forEach(DatastoreManager.register)
  }
}
