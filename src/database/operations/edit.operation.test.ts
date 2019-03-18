import { testCreateRandomPlanets, testStore, Planet } from "../../index.test.config";
import { SortDirection } from "../sort/sort.types";
import * as _ from 'lodash'

describe('EDIT operation', () => {
  describe('edits', () => {
    it('via item', async () => {
      const item = new Planet('pluto', 0)

      await testStore.push().item(item).run()
      await testStore.edit().item(item).with({name: 'mars'}).run()

      const newItem = await testStore.get().first()
      expect(newItem.name).toBe('mars')
    })
    it('via id', async () => {
      let item = new Planet('pluto', 0)

      item = await testStore.push().item(item).run()
      await testStore.edit().id(item.meta.id).with({name: 'mars'}).run()

      const newItem = await testStore.get().first()
      expect(newItem.name).toBe('mars')
    })
  })
})