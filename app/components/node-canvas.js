import Component from '@ember/component';
import {inject as service} from '@ember/service';

export default Component.extend({
  neo4j: service('neo4j-connection'),
  graphCache: service('graph-data-cache'),

  edit: false,
  id: null,

  actions: {
    selectNode(nodeId) {
      console.log('Clicked: ' + nodeId)
      this.set('id', nodeId)
      console.log(this.get('id'))
      this.set('edit', true)
      let query = 'match(n) where id(n) = '+nodeId+' return n'
    },
    selectEdge(edgeId) {
      console.log('Clicked: ' + edgeId)
      let query = 'match ()-[r]->() where id(r) = '+edgeId+' return r'
      return this.get('neo4j.session')
        .run(query)
        .then(function (result) {
          console.log(result.records[0].toObject().r)
        })
    },
    newNode() {
      console.log('creating new node')
      let query = 'CREATE (n:Test)'
      return this.get('neo4j.session')
      .run(query)
      .then(function (result) {
        console.log(result)
      })
    },
    newEdge() {
      console.log('creating new edge')
    }
  }
});
