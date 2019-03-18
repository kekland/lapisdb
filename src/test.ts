import { Model, Datastore } from ".";

export class Human extends Model<Human> {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    super()
    this.name = name
    this.age = age
  }
}

async function start() {
  const store = new Datastore<Human>('human', './database', () => Human)
  const human = await store.push().item(new Human('John', 19)).run()
  const humans = await store.get().filter((value) => value.age > 18)
  human.delete()
}

start()