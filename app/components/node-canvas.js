import Component from '@ember/component';
import {inject as service} from '@ember/service';
import { set } from '@ember/object';

export default Component.extend({
  neo4j: service('neo4j-connection'),
  graphCache: service('graph-data-cache'),
  rb: service('relationship-builder'),

  types: ['Performance_Of', 'Performed_By', 'Performed_In', 'References', 'Wrote'],
  choice: 'Choose a Relationship Type...',

  id: null,
  selectedNode: null,
  editingEdges: false,

  options: {
    interaction: {
      dragNodes: false,
    },
    manipulation: {
      enabled: false,
      initiallyActive: false,
      addNode: false,
      addEdge: true
    },
    nodes: {
      shape: 'dot'
    }
  },

  doubleClick(options) {
    const graphCache = this.get('graphCache');
    let query = 'create (n:InitialLabel {Property1: "Change me"}) return n';
    graphCache.query(query);
  },

  actions: {
    selectEdge(edgeId) {
      let query = 'match ()-[r]->() where id(r) = '+edgeId+' return r';
      return this.get('neo4j.session')
        .run(query)
        .then(function (result) {
        })
    },
    edgeAdded(edge) {
      if (edge.from != edge.to) {
        this.get('rb').set('showModal', true)
        this.set('edge', edge)
      } else {
        console.log('don\'t connect a node to itself')
      }
    },      
    confirmEdgeAdd(edge, choice) {
      const graphCache = this.get('graphCache');
      let source = edge.from;
      let destination = edge.to;
      let query = 'MATCH(n),(m) WHERE ID(n) = '+source+' AND ID(m) = '+destination+' create (n)-[r:'+choice+']->(m) return n,m'
      console.log(query)  
      graphCache.query(query)
    },
    toggleConnections() {
      this.toggleProperty('editingEdges')
    },
    makeVisible(id) {
      for (let i = 0; i < this.get('model').length; i++) {
        if (this.get('model')[i].id == id) {
          set(this.get('model')[i], 'isVisible', true)
        }
        if (this.get('model')[i].id == this.get('selectedNode')) {
          set(this.get('model')[i], 'isVisible', false)
        }
      }
      this.set('selectedNode', id)
    },
    submit() {
      this.get('rb').set('showModal', false)
      this.send('confirmEdgeAdd', this.get('edge'), this.get('choice'))
      this.set('choice', "Choose a Relationship Type...")
    },
    close() {
      this.get('rb').set('showModal', false)
      this.set('choice', "Choose a Relationship Type...")
    },
    chooseType(type) {
      this.set('choice', type)
    }
  }
});