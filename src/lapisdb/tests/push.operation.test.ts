import { testStore, Planet } from "../../index.test.config";
import * as _ from 'lodash'
import { PushOperation } from '../..';

describe('PUSH operation', () => {
  describe('adds', () => {
    it('single element through PushOperation', async () => {
      const planet = new Planet('planet', 0)
      new PushOperation(testStore).item(planet).run()

      const count = await testStore.getItems()
      expect(count.length).toEqual(1)
    })
    it('single element through Datastore', async () => {
      const planet = new Planet('planet', 0)
      await testStore.push(planet)

      const count = await testStore.getItems()
      expect(count.length).toEqual(1)
    })
    it('five elements', async () => {
      for (let i = 0; i < 5; i++) {
        const planet = new Planet('planet', i)
        await testStore.push(planet)
      }

      const count = await testStore.getItems()
      expect(count.length).toEqual(5)
    })
  })
})