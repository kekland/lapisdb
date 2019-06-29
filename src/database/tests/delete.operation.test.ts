import { testStore, Planet } from "../../index.test.config";
import * as _ from 'lodash'

describe('DELETE operation', () => {
  describe('deletes', () => {
    describe('single object', () => {
      it('via item', async () => {
        const item = new Planet('pluto', 0)
  
        await testStore.push(item)
        await testStore.remove(item)
  
        const items = await testStore.getItems()
        expect(items.length).toBe(0)
      })
      it('via id', async () => {
        const item = new Planet('pluto', 0)
  
        await testStore.push(item)
        await testStore.remove(item.meta.id as any)
  
        const items = await testStore.getItems()
        expect(items.length).toBe(0)
      })
    })
  })
})