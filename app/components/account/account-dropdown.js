import Component from '@ember/component';
import {inject as service} from '@ember/service';

export default Component.extend({
  router: service('router'),
  graphCache: service('graph-data-cache'),

  init() {
    this._super(...arguments)
    this.set('currentUser', localStorage.user)
  },
 
  actions: {
    logout() {
      this.get('router').transitionTo('login')
      this.get('graphCache').empty()
      this.set('login', false)
    },

    goToGuide() {
      //this should open up a modal which contains the guide component.
      //that same component should be accessible from the welcome page as an intro.
      //this button will open it up as a reminder.
    }
  }
});
