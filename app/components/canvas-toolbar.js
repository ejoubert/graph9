import Component from '@ember/component';
import {inject as service} from '@ember/service'

export default Component.extend({
  graphCache: service('graph-data-cache'),

  actions: {
    addTestNode() {
      const graphCache = this.get('graphCache');
      let newNode = {
        name: "Test",
        isNode: true,
        id: 999
      }
      graphCache.add(newNode)
      console.log('adding test node')
    },
    addDataSet() {
      const graphCache = this.get('graphCache');
      // let query = 'match(n:Opera_Performance)-[r]-(m:Place) return n,m,r limit 10'
      let query = 'match(n) return n limit 100'
      graphCache.query(query)
    }
  }
});