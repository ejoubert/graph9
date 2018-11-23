import Component from '@ember/component';
import {inject as service} from '@ember/service';

export default Component.extend({
  router: service('router'),
  graphCache: service('graph-data-cache'),

  init() {
    this._super(...arguments)
    this.set('currentUser', localStorage.user)
    this.set('connection', localStorage.connection)
  },
 
  actions: {
    logout() {
      this.get('router').transitionTo('login')
      this.get('graphCache').empty()
      this.set('login', false)
    },

    goToGuide() {
      this.showGuide()
    }
  }
});
