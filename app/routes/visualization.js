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
    let promise = new Promise((resolve) => {
      let data = this.graphCache.loadModel(params)
      console.log(data)
      resolve(data)
    })
    promise.then((data) => {
      console.log(data)
      return data
    })
    // if (params.label === null && params.property === null && params.searchTerm === null) {
    //   nodes = []
    // } else {
    //   if (params.loaded) {
    //     let preloaded = []
    //     params.loaded.forEach(id => {
    //       this.graphCache.loadConnections(id).then(nodes => {
    //         preloaded.push(nodes)
    //       })
    //     })


    //     return RSVP.hash({
    //       nodes: this.graphCache.loadModel(params),
    //       preloaded: preloaded
    //     })
    //       .then(data => {
    //         preloaded.forEach(result => {
    //           result.forEach(node => {
    //             data.nodes.push(node)
    //           });
    //         });
    //         return data.nodes.uniqBy('id')
    //       })
    //   } else {
    //     return RSVP.hash({
    //       nodes: this.graphCache.loadModel(params)
    //     })
    //       .then(data => {
    //         return data.nodes
    //       })
    //   }
    // }
  },

  setupController(controller, model) {
    this._super(controller, model)
    controller.set('graphCache', this.graphCache)
  }
})
