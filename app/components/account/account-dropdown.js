import Component from '@ember/component'
import { inject as service } from '@ember/service'

export default Component.extend({
  router: service(),
  graphCache: service('graph-data-cache'),

  init () {
    this._super(...arguments)
    this.set('currentUser', localStorage.user)
    this.set('connection', localStorage.connection)
  },

  actions: {
    logout () {
      this.router.transitionTo('login')
      this.graphCache.empty()
      this.set('login', false)
    },

    goToGuide () {
      this.showGuide()
    }
  }
})
