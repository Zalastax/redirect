import Loki from 'lokijs'


export default (name) => {
    return new Promise((resolve) => {
        const db = new Loki(name, {
            autosave: true
            , autosaveInterval: 10000
            , autoload: true
            , autoloadCallback: () => {
                const redirects = db.getCollection('redirects')
                if (redirects === null) {
                    db.addCollection('redirects', { unique: ['identifier'] })
                }

                const tokens = db.getCollection('tokens')
                if (tokens === null) {
                    db.addCollection('tokens', { unique: ['token'], indices: ['created'] })
                }
                resolve(db)
            }
        })
    })
}
