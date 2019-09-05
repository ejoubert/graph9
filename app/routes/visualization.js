import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'
import RSVP from 'rsvp';

export default Route.extend({
  dataCache: service('cache'),
  router: service(),

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
    }
  },

  beforeModel() {
    this.dataCache.login().then((result) => {
      if (!result) {
        const dataCache = this.dataCache
        dataCache.init()
      } else {
        this.router.transitionTo('welcome')
      }
    })
  },

  model(params) {
    let promise = new Promise(resolve => {
      let data = this.dataCache.loadModel(params)
      resolve(data)
    })
    return promise.then(data => {
      return data
    })
  },

  setupController(controller, model) {
    this._super(controller, model)
    controller.set('dataCache', this.dataCache)
  }
})
