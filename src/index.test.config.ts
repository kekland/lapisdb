import { Model, Datastore } from ".";
import { SortDirection } from "./database/sort/sort.types";

/** @ignore */
export class Human {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name
    this.age = age
  }
}

/** @ignore */
export class Planet extends Model<Planet> {
  name: string;
  index: number;
  people: Human[];

  constructor(name: string, index: number) {
    super()
    this.name = name
    this.index = index
    this.people = []
  }

  public addHuman() {
    this.people.push(new Human(`Citizen of planet ${this.name} number ${this.people.length + 1}`, 0))
  }

  public age() {
    this.people.forEach(human => human.age += 1)
  }
}

export let testStore: Datastore<Planet> = null

beforeEach(async () => {
  testStore = new Datastore<Planet>('test', './database', () => Planet)
  const items = await testStore.get().result()
  await testStore.deleteBatched().items(items).run()
})

afterEach(async () => {
  await testStore.methods.store.close()
})

export const testCreateRandomPlanets = async (push: boolean = false) => {
  const data: Planet[] = []
  for (let i = 0; i < 100; i++) {
    data.push(new Planet(`Planet ${i}`, i))
  }

  if (push) {
    await testStore.pushBatched().items(data).run()
  }
  return data
}