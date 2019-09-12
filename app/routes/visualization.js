import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'
import { later } from '@ember/runloop'

export default Route.extend ({
  dataCache: service('cache'),
  router: service(),

  autoRefreshInSeconds: 10,

  queryParams: {
    labels: {
      refreshModel: true
    },
    properties: {
      refreshModel: true
    },
    searchTerms: {
      refreshModel: true
    },
    loaded: {
      refreshModel: true
    },
    loadedIds: {
      refreshModel: false
    }
  },

  beforeModel() {
    this.dataCache.login().then((result) => {
      if (!result) {
        const dataCache = this.dataCache
        dataCache.init()
      }
    })
  },

  async model(params) {
    let promise = new Promise(resolve => {
      let data = this.dataCache.loadModel(params)
      resolve(data)
    })
    return promise.then(data => {
      // later(this, () => {
        // console.log('fetching data')
        // return this.model(params)
      // }, (1000 * this.autoRefreshInSeconds))
      return data
    })
  },

  setupController(controller, model) {
    this._super(controller, model)
    controller.set('dataCache', this.dataCache)
  }
})
