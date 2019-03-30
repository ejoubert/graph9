import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'
import RSVP from 'rsvp';

export default Route.extend({
  graphCache: service('graph-data-cache'),
  router: service(),

  queryParams: {
    label: {
      refreshModel: true
    },
    property: {
      refreshModel: true
    },
    searchTerm: {
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
    if (!params.label || !params.property || !params.searchTerm) {
      console.log('no query params')
      return []
    } else {
      return RSVP.hash({
        nodes: this.graphCache.loadModel(params)
      })
        .then(data => {
        return data.nodes
      })
    }
  },

  setupController(controller, model) {
    this._super(controller, model)
    controller.set('graphCache', this.graphCache)
  }
})
