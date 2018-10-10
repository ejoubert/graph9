import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default Route.extend({
  graphCache: service('graph-data-cache'),
  router: service('router'),

  beforeModel() {
    const graphCache = this.get('graphCache')
    graphCache.init()
    if (localStorage.connection != "null") {
      this.get('router').transitionTo('visualization')
    } else {
      this.get('router').transitionTo('welcome')
    }
  }
});