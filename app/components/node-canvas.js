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
    // this.set('types', ['Brother', 'Mother', 'Father', 'Sister', 'Son', 'Daughter', 'Husband', 'Wife'])
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
        scaling: {
          min: 25,
          max: 35,
          customScalingFunction: function (min,max,total,value) {
            if (max === min) {
              return 0;
            }
            else {
              var scale = 1 / (max - min);
              return Math.max(0,(value - min)*scale);
            }
          }
        },
        value: 10
      },
      physics: {
        enabled: true
      },
      edges: {
        title: 'edge',
        label: 'label'
      }

    })
  },

  actions: {

    selectEdge(edgeId) {
      let query = 'match(n)-[r]-(m) where id(r) ='+edgeId+' return r'
      return this.get('neo4j.session')
      .run(query)
      .then((result) => {
        console.log(result.records[0]._fields[0].type)
      })
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
      this.toggleProperty('editingEdges')
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