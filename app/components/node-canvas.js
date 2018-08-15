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
        multiselect: true,
        hover: true
      },
      manipulation: {
        enabled: false,
        initiallyActive: false,
        addNode: false,
        addEdge: true
      },
      nodes: {
        shape: 'dot',
        size: 25
      }
    })
  },

  actions: {

    selectEdge(edgeId) {
    },
    edgeAdded(edge) {
      if (edge.from != edge.to) {
        this.get('rb').set('showModal', true)
        this.set('edge', edge)
      } else {
        console.log('Don\'t connect a node to itself')
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
    },
    double(evt) {
      let pos = {x: evt.pointer.canvas.x, y: evt.pointer.canvas.y}
      const graphCache = this.get('graphCache');
      graphCache.newNode(pos)
    },
  }
});