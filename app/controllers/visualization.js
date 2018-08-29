import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  router: service('router'),
  graphCache: service('graph-data-cache'),

  actions: {
    logout() {
      this.get('router').transitionTo('login')
      this.get('graphCache').empty()
      delete window.sessionStorage.username
      delete window.sessionStorage.password
      delete window.sessionStorage.neo4jPass
      delete window.sessionStorage.neo4jUser
      delete window.sessionStorage.connection
    }
  }
});
