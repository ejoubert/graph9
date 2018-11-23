import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default Route.extend({
  graphCache: service('graph-data-cache'),
  router: service('router'),

  beforeModel() {
    this.graphCache.login().then((result)=>{
      if (!result) {
        const graphCache = this.get('graphCache')
        graphCache.init()
      } else {
        this.get('router').transitionTo('welcome')
      }
    })
  },

  model() {
    const graphCache = this.get('graphCache')
    return graphCache.query()
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set('graphCache', this.get('graphCache'))
  },
})