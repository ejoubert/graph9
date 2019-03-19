import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'

export default Route.extend({
  graphCache: service('graph-data-cache'),
  router: service(),


  model () {
    this.graphCache.login().then((result) => {
      if (!result) {
        const graphCache = this.graphCache
        graphCache.init()
        this.router.transitionTo('visualization')
      } else {
        this.router.transitionTo('welcome')
      }
    })
    const graphCache = this.graphCache
    return graphCache.query()
  },

  setupController (controller, model) {
    this._super(controller, model)
    controller.set('graphCache', this.graphCache)
  }
})
