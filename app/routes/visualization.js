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
    if (!params.label || !params.property || !params.searchTerm) {
      return []
    } else {
      if (params.loaded) {
        let preloaded = []
        params.loaded.forEach(id => {
          this.graphCache.loadConnections(id).then(nodes => {
            preloaded.push(nodes)
          })
        })


        return RSVP.hash({
          nodes: this.graphCache.loadModel(params),
          preloaded: preloaded
        })
          .then(data => {
            preloaded.forEach(result => {
              result.forEach(node => {
                data.nodes.push(node)
              });
            });
            console.log(data.nodes)
            return data.nodes.uniqBy('id')
          })
      } else {
        return RSVP.hash({
          nodes: this.graphCache.loadModel(params)
        })
          .then(data => {
            return data.nodes
          })

      }
    }
  },

  setupController(controller, model) {
    this._super(controller, model)
    controller.set('graphCache', this.graphCache)
  }
})
