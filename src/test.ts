import { Model, Datastore } from ".";
import { SortDirection } from "./database/sort/sort.types";

/** @ignore */
export class Human extends Model<Human> {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    super()
    this.name = name
    this.age = age
  }
}
/** @ignore */
async function start() {
  const store = new Datastore<Human>('human', './database', () => Human)
  const human = await store.push().item(new Human('John', 19)).run()
  const humans = await store.get().sort({age: {sort: SortDirection.Ascending}})
  human.delete()
}

start()