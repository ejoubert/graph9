/*
Holds the actions for the node canvas, sets the options for the visjs network, and options for the power-select menu that is used to select
the type of relationship in the relationship modal
*/

import Component from '@ember/component';
import {inject as service} from '@ember/service';

export default Component.extend({
  graphCache: service('graph-data-cache'),
  rb: service('relationship-builder'),
  router: service('router'),

  types: null,
  choice: 'Choose a Relationship Type...',

  id: null,
  selectedNode: null,
  editingEdges: false,

  options: null,

  init() {
    this._super(...arguments)
    this.set('types', ['CELEBRATES','COMPOSED','CONTAINS','CRITIQUED','ORIGIN','PERFORMANCE_OF','PERFORMED','PERFORMED_IN','PRODUCED','REFERENCES','REVIEWS','WROTE','WROTE_TEXT'])
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
        enabled: true,
        // solver: 'forceAtlas2Based',
        timestep: 0.5
      },
      edges: {
        title: 'edge',
        label: 'label'
      },
      layout: {
        improvedLayout: false
      }
    })
  },




  actions: {

    toggle(e) {
      if (e.altKey) {
        this.toggleProperty('editingEdges')
      }
    },

    //Toggles between "Draw Relationships" and "Cancel". Relationships can be created by dragging from node to node when (editingEdges=true)
    toggleConnections() {
      this.toggleProperty('editingEdges')
    },

    //Set the type of relationship that will be created on Submit(). This value is chosen using the power-select menu while relationship modal is active
    chooseType(type) {
      this.set('choice', type)
    },

    //Sets the edge source(edge.from) and destination(edge.to) if they are not the same node. These values are used on Submit()
    edgeAdded(edge) {
      if (edge.from != edge.to) {
        this.get('rb').set('showModal', true)
        this.set('edge', edge)
      } else {
        //Nothing happens when user tries to connect node to itself
      }
    },

    //After all other confirmations, the edge is added to the database. editingEdges is set to false for usability
    confirmEdgeAdd(edge, choice) {
      const graphCache = this.get('graphCache');
      graphCache.addEdge(edge, choice)
      this.toggleProperty('editingEdges')
    },

    //Empty action needed to prevent matchingChildEdge.get(...) error on node or edge select
    selectEdge() {
    },

    //Closes the relationship modal, executes confirmEdgeAdd(), and resets "choice"
    submit() {
      this.get('rb').set('showModal', false)
      this.send('confirmEdgeAdd', this.get('edge'), this.get('choice'))
      this.set('choice', "Choose a Relationship Type...")
    },

    //Closes the relationship modal, and resets "choice"
    close() {
      this.get('rb').set('showModal', false)
      this.set('choice', "Choose a Relationship Type...")
    },
    
    //Double-click event which creates a new node at the pointer's position
    double(evt) {
      let pos = {x: evt.pointer.canvas.x, y: evt.pointer.canvas.y}
      const graphCache = this.get('graphCache');
      graphCache.newNode(pos)
    }
  }
});