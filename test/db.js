import {expect} from 'chai'
import db from '../src/db'
//import { it } from 'arrow-mocha/es5'

describe('db', () => {
    it('should return a promise that gets fulfilled', () => {
        const randomName = (Math.random().toString(36) + '00000000000000000').slice(2, 8 + 2) + '.json'
        return db(randomName).then((value) => {
            expect(value).to.exist
        })
    })
})
