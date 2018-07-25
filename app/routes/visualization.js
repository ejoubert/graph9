import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import { getOwner } from '@ember/application';
import { computed } from '@ember/object';

export default Route.extend({
  neo4j: service('neo4j-connection'),
  graphCache: service('graph-data-cache'),
  graphCache: computed(function() {
    return getOwner(this).lookup('service:graph-data-cache')
  }),

  model() {
    const graphCache = this.get('graphCache');
    let query = 'match (n:Opera_Performance)-[r]-(m:Ideal_Opera) return n,m,r limit 10'
    graphCache.init()
    graphCache.query(query)
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set('graphCache', this.get('graphCache'))
  }
})