import { testCreateRandomPlanets, testStore, Planet } from "../../index.test.config";
import { SortDirection } from "../sort/sort.types";
import * as _ from 'lodash'

describe('DELETE operation', () => {
  describe('deletes', () => {
    describe('single object', () => {
      it('via item', async () => {
        const item = new Planet('pluto', 0)
  
        await testStore.push().item(item).run()
        await testStore.delete().item(item).run()
  
        const count = await testStore.get().count()
        expect(count).toBe(0)
      })
      it('via id', async () => {
        const item = new Planet('pluto', 0)
  
        await testStore.push().item(item).run()
        await testStore.delete().id(item.meta.id).run()
  
        const count = await testStore.get().count()
        expect(count).toBe(0)
      })
    })

    describe('batched', () => {
      describe('single object', () => {
        it.todo('via item')
        it.todo('via id')
      })
      describe('multiple object', () => {
        it.todo('via item')
        it.todo('via id')
      })
    })
  })
})