import Controller from '@ember/controller'
import { inject as service } from '@ember/service'

export default Controller.extend({
  router: service('router'),

  actions: {
    login () {
      this.get('router').transitionTo('login')
    }
  }
})
