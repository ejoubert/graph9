import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'

export default Route.extend({
  graphCache: service('graph-data-cache'),
  router: service(),

  beforeModel() {
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
  }
})
