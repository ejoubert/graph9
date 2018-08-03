import Component from '@ember/component';
import {inject as service} from '@ember/service';
import { set } from '@ember/object';

export default Component.extend({
  neo4j: service('neo4j-connection'),
  graphCache: service('graph-data-cache'),
  rb: service('relationship-builder'),

  types: null,
  choice: 'Choose a Relationship Type...',

  id: null,
  selectedNode: null,
  editingEdges: false,

  options: null,

  init() {
    this._super(...arguments)
    this.set('types', ['Performance_Of', 'Performed_By', 'Performed_In', 'References', 'Wrote'])
    this.set('options', {
    interaction: {
      dragNodes: false,
      multiselect: true
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
  })
  },

  doubleClick(evt) {
    console.log('I double clicked in node-canvas')
    const graphCache = this.get('graphCache');
    let pos = this.get('edgesNetwork.network.canvas').DOMtoCanvas({x: evt.offsetX, y: evt.offsetY})
    graphCache.newNode(pos)
  },

  actions: {
    selectEdge(edgeId) {
      let query = 'match ()-[r]->() where id(r) = '+edgeId+' return r';
      return this.get('neo4j.session')
        .run(query)
        .then(function () {
        })
    },
    edgeAdded(edge) {
      if (edge.from != edge.to) {
        this.get('rb').set('showModal', true)
        this.set('edge', edge)
      } else {
        alert('Don\'t connect a node to itself')
      }
    },      
    confirmEdgeAdd(edge, choice) {
      const graphCache = this.get('graphCache');
      let source = edge.from;
      let destination = edge.to;
      let query = 'MATCH(n),(m) WHERE ID(n) = '+source+' AND ID(m) = '+destination+' create (n)-[r:'+choice+']->(m) return n,m'
      graphCache.query(query)
    },
    toggleConnections() {
      this.toggleProperty('editingEdges')
    },
    makeVisible(id) {
      for (let i = 0; i < this.get('model').length; i++) {
        if (this.get('model')[i].id == id) {
          set(this.get('model')[i], 'isVisible', true)
        } else {
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