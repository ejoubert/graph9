import Component from '@ember/component';
import {inject as service} from '@ember/service'

export default Component.extend({
  graphCache: service('graph-data-cache'),

  actions: {
    addTestNode() {
      const graphCache = this.get('graphCache');
      let newNode = {
        name: "Test Node",
        isNode: true,
        id: 999
      }
      graphCache.add(newNode)
    },
    addDataSet() {
      const graphCache = this.get('graphCache');
      let query = 'match(n) return n limit 100'
      graphCache.query(query)
    }
  }
});