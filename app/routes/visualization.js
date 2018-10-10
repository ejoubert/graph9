import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default Route.extend({
  graphCache: service('graph-data-cache'),
  router: service('router'),

  beforeModel() {
    if (localStorage.connection == "null" || localStorage.connection == undefined) {
      this.get('router').transitionTo('welcome')
    }
  },

  model() {
    const graphCache = this.get('graphCache')
    return graphCache.query()
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set('graphCache', this.get('graphCache'))
  }
})