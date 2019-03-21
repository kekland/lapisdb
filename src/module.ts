import { Datastore } from ".";
import { Human, Planet } from "./index.test.config";
import { SortDirection } from "./database/sort/sort.types";
/*
async function run() {
  const store = new Datastore<Planet>('test', './database', () => Planet);
  const planets = await store
    .get()
    .filter((data) => data.name.includes("1"))
    .sort({name: {sort: SortDirection.Ascending}})
    .run()
  console.log(planets)
}

run()*/