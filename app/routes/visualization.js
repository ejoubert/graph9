import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default Route.extend({
  graphCache: service('graph-data-cache'),

  model() {
    const graphCache = this.get('graphCache');
    return graphCache.query()
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set('graphCache', this.get('graphCache'))
  }
})