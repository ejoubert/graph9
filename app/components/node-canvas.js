import Component from '@ember/component';
import {inject as service} from '@ember/service';
import { set } from '@ember/object';

export default Component.extend({
  neo4j: service('neo4j-connection'),
  graphCache: service('graph-data-cache'),

  edit: false,
  id: null,
  selectedNode: null,

  doubleClick(id) {
    console.log('i double clicked')
    const graphCache = this.get('graphCache');
    let query = 'match (n)-[r]-(m) return n,m,r limit 10';
    graphCache.query(query);
  },

  actions: {
    selectNode(nodeId) {
      console.log('Clicked: ' + nodeId);
      this.set('id', nodeId);
      console.log(this.get('id'));
      this.set('edit', true);
    },
    selectEdge(edgeId) {
      console.log('Clicked: ' + edgeId);
      let query = 'match ()-[r]->() where id(r) = '+edgeId+' return r';
      return this.get('neo4j.session')
        .run(query)
        .then(function (result) {
          console.log(result.records[0].toObject().r);
        })
    },
    newNode() {
      console.log('creating new node');
      let query = 'CREATE (n:Test)';
      console.log(query);
      return this.get('neo4j.session')
      .run(query)
      .then(function (result) {
        console.log(result);
      })
    },
    edgeAdded() {

    },
    makeVisible(id) {
      if (this.get('selectedNode')) {
        console.log('previously selected node: '+ this.get('selectedNode'))  
      }
      console.log('toggling '+id)
      for (let i = 0; i < this.get('model').length; i++) {
        if (this.get('model')[i].id == id) {
          set(this.get('model')[i], 'isVisible', true)
        }
        if (this.get('model')[i].id == this.get('selectedNode')) {
          set(this.get('model')[i], 'isVisible', false)
        }
      }
      this.set('selectedNode', id)
    }
  }
});