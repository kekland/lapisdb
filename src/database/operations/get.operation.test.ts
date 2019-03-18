import { testCreateRandomPlanets, testStore, Planet } from "../../index.test";
import { SortDirection } from "../sort/sort.types";

describe('GET operation', () => {
  describe('gets', () => {
    test('all elements', async () => {
      const data: Planet[] = await testCreateRandomPlanets(true)
      const received = await testStore.get().result()

      expect(received).toHaveLength(data.length)
    })
    test('first element by sorting index', async () => {
      const data: Planet[] = await testCreateRandomPlanets(true)
      const received = await testStore.get().sort({index: {sort: SortDirection.Ascending}}).first()
      expect(received).toEqual(data[0])
    })
    test('single element by filtering index', async () => {
      const index = 55
      const data: Planet[] = await testCreateRandomPlanets(true)
      const received = await testStore.get().filter((planet) => planet.index == index).first()
      expect(received).toEqual(data[index])
    })
  })
})

