import Controller from '@ember/controller'
import { inject as service } from '@ember/service'

export default Controller.extend({
  router: service(),
  graphCache: service('graph-data-cache'),

  projectName: 'Graph9',

  actions: {
    logout () {
      this.router.transitionTo('login')
      this.graphCache.empty()
      this.set('login', false)
    }
  }
})
