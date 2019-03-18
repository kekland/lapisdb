import { testCreateRandomPlanets, testStore, Planet } from "../../index.test.config";
import { SortDirection } from "../sort/sort.types";
import * as _ from 'lodash'

describe('PUSH operation', () => {
  describe('adds', () => {
    it('single element', async () => {
      const planet = new Planet('planet', 0)
      await testStore.push().item(planet).run()

      const count = await testStore.get().count()
      expect(count).toEqual(1)
    })
    it('five elements', async () => {
      for (let i = 0; i < 5; i++) {
        const planet = new Planet('planet', i)
        await testStore.push().item(planet).run()
      }

      const count = await testStore.get().count()
      expect(count).toEqual(5)
    })
    describe('batched', () => {
      it('single element', async () => {
        const planet = new Planet('planet', 0)
        await testStore.pushBatched().item(planet).run()
  
        const count = await testStore.get().count()
        expect(count).toEqual(1)
      })
      it('five elements', async () => {
        const operation = testStore.pushBatched()
        for (let i = 0; i < 5; i++) {
          const planet = new Planet('planet', i)
          operation.item(planet)
        }
        await operation.run()
  
        const count = await testStore.get().count()
        expect(count).toEqual(5)
      })
    })
  })
})