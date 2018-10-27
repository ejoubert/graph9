import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  router: service('router'),
  graphCache: service('graph-data-cache'),

  projectName: "Graph9",

  actions: {
    logout() {
      this.get('router').transitionTo('login')
      this.get('graphCache').empty()
      this.set('login', false)
    }
  }
});