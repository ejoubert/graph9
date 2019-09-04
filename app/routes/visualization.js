import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'
import RSVP from 'rsvp';

export default Route.extend({
  graphCache: service('graph-data-cache'),
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
    this.graphCache.login().then((result) => {
      if (!result) {
        const graphCache = this.graphCache
        graphCache.init()
      } else {
        this.router.transitionTo('welcome')
      }
    })
  },

  model(params) {
    let promise = new Promise(resolve => {
      let data = this.graphCache.loadModel(params)
      resolve(data)
    })
    promise.then(data => {
      return data
    })
  },

  setupController(controller, model) {
    this._super(controller, model)
    controller.set('graphCache', this.graphCache)
  }
})
