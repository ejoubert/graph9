import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default Route.extend({
  neo4j: service('neo4j-connection'),
  graphCache: service('graph-data-cache'),

  model() {
    const graphCache = this.get('graphCache');
    let query = 'match (n:Opera_Performance)-[r]-(m:Ideal_Opera) return n,m,r limit 15'
    // let query = 'match(n) return n'
    graphCache.init()
    graphCache.query(query)
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set('graphCache', this.get('graphCache'))
  }
})