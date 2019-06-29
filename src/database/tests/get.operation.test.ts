import { testCreateRandomPlanets, testStore, Planet } from "../../index.test.config";
import { SortDirection } from "../sort/sort.types";
import * as _ from 'lodash'

describe('GET operation', () => {
  describe('gets', () => {
    it('all elements', async () => {
      const data: Planet[] = await testCreateRandomPlanets(true)
      const received = await testStore.get().result()

      expect(received).toHaveLength(data.length)
    })
    it('single element by filtering index', async () => {
      const index = 55
      const data: Planet[] = await testCreateRandomPlanets(true)
      const received = await testStore.get()
        .filter((planet) => planet.index == index)
        .first()
      expect(received).toEqual(data[index])
    })
    it('five elements by filtering index', async () => {
      const data: Planet[] = await testCreateRandomPlanets(true)
      const received = await testStore.get()
        .filter((planet) => planet.index >= 0 && planet.index < 5)
        .sort({index: {sort: SortDirection.Ascending}})
        .result()
      const dataSplit = data.slice(0, 5)
      expect(received).toEqual(dataSplit)
    })
    it('all elements by sorting index', async () => {
      const data: Planet[] = await testCreateRandomPlanets(true)
      const received = await testStore.get()
        .sort({index: {sort: SortDirection.Ascending}})
        .result()
      expect(received).toEqual(data)
    })
    it('item by its id', async () => {
      const data: Planet[] = await testCreateRandomPlanets(true)
      const firstPlanet = data[0]
      const received = await testStore.get().id(firstPlanet.meta.id).first()
      expect(received).toEqual(firstPlanet)
    })
    it('item that does not exist', async () => {
      const data: Planet[] = await testCreateRandomPlanets(true)
      const firstPlanet = data[0]
      const received = await testStore.get().id(firstPlanet.meta.id + '1').first()
      expect(received).toEqual(null)
    })
  })
})

