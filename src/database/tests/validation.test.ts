import { testCreateRandomPlanets, testStore, Planet } from "../../index.test.config";
import { SortDirection } from "../sort/sort.types";
import * as _ from 'lodash'

describe('Validation', () => {
  describe('during pushing', () => {
    it('should catch invalid item', async () => {
      try {
        const newPlanet = await testStore.pushItem(new Planet('a', -1))
        throw { message: 'Validation let through invalid item', code: 1 }
      }
      catch (e) {
        if (e.code === 1) {
          throw e;
        }
        return true
      }
    })
    it('should let through valid item', async () => {
      try {
        const newPlanet = await testStore.pushItem(new Planet('a', 0))
        return true
      }
      catch (e) {
        throw e;
      }
    })
  })

  describe('during editing', () => {
    it('should catch invalid item', async () => {
      try {
        const planet = await testStore.pushItem(new Planet('a', 0))
        const editedPlanet = await testStore.editItem(planet, { index: -1 })
        throw { message: 'Validation let through invalid item', code: 1 }
      }
      catch (e) {
        if (e.code === 1) {
          throw e;
        }
        return true
      }
    })
    it('should let through valid item', async () => {
      try {
        const planet = await testStore.pushItem(new Planet('a', 0))
        const editedPlanet = await testStore.editItem(planet, { index: 1 })
        return true
      }
      catch (e) {
        throw e;
      }
    })
  })
})