import { testCreateRandomPlanets, testStore, Planet } from '../../index.test.config';
import _ from 'lodash'
import { GetOperation } from '../../.';
import { classToPlain } from 'class-transformer';

describe('GET operation', () => {
  describe('gets', () => {
    describe('all elements', () => {
      it('through GetOperation', async () => {
        const data: Planet[] = await testCreateRandomPlanets(true)
        const received = await new GetOperation(testStore).run()

        expect(received).toHaveLength(data.length)
      })

      it('through Datastore', async () => {
        const data: Planet[] = await testCreateRandomPlanets(true)
        const received = await testStore.getItems()

        expect(received).toHaveLength(data.length)
      })
    })

    describe('single element', () => {
      it('through GetOperation', async () => {
        const index = 55
        const data: Planet[] = await testCreateRandomPlanets(true)
        const received = await new GetOperation(testStore)
          .filter((planet) => planet.index === index)
          .first()
        expect(classToPlain(received)).toMatchObject(classToPlain(data[index]))
      })

      it('through Datastore', async () => {
        const index = 55
        const data: Planet[] = await testCreateRandomPlanets(true)
        const received = await testStore.getItems((v) => v.index === index)
        expect(received[0]).toMatchObject(classToPlain(data[index]))
      })

      it('through Datastore using conditions', async () => {
        const index = 55
        const data: Planet[] = await testCreateRandomPlanets(true)
        const received = await testStore.get({ index: 55 })
        expect(received).toMatchObject(classToPlain(data[index]))
      })

      it('through Datastore using conditions with multiple keys', async () => {
        const index = 55
        const data: Planet[] = await testCreateRandomPlanets(true)
        const received = await testStore.get({ index, name: `Planet ${index}` })
        expect(received).toMatchObject(classToPlain(data[index]))
      })
    })

    describe('five elements', () => {
      it('through GetOperation', async () => {
        const data: Planet[] = await testCreateRandomPlanets(true)
        const received = await new GetOperation(testStore)
          .filter((planet) => planet.index >= 0 && planet.index < 5)
          .run()

        received.sort((a, b) => a.index - b.index)
        const dataSplit = data.slice(0, 5)
        expect(classToPlain(received)).toMatchObject(classToPlain(dataSplit))
      })

      it('through Datastore', async () => {
        const data: Planet[] = await testCreateRandomPlanets(true)
        const received = await testStore.getItems((planet) => planet.index >= 0 && planet.index < 5)
        received.sort((a, b) => a.index - b.index)
        const dataSplit = data.slice(0, 5)
        expect(classToPlain(received)).toMatchObject(classToPlain(dataSplit))
      })
    })

    describe('non-existent item', () => {
      it('through GetOperation', async () => {
        const data: Planet[] = await testCreateRandomPlanets(true)
        const firstPlanet = data[0]
        const received = await new GetOperation(testStore).id(firstPlanet.meta.id + '1').first()
        expect(classToPlain(received)).toEqual(null)
      })

      it('through Datastore', async () => {
        const data: Planet[] = await testCreateRandomPlanets(true)
        const firstPlanet = data[0]
        const received = await testStore.get(firstPlanet.meta.id + '1')
        expect(classToPlain(received)).toEqual(null)
      })
    })
  })
})
