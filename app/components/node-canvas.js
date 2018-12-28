import Component from '@ember/component'
import { inject as service } from '@ember/service'

export default Component.extend({
  graphCache: service('graph-data-cache'),
  rb: service('relationship-builder'),
  router: service(),

  types: null,
  labels: null,
  id: null,
  selectedNode: null,
  properties: null,
  options: null,
  searching: false,
  labelIsChosen: false,
  propertyIsChosen: false,
  noName: false,
  editingEdges: false,
  labelChoice: 'Choose a label type to begin',
  propertyChoice: 'Choose a property type to continue',

  init () {
    this._super(...arguments)
    const graphCache = this.graphCache
    this.set('labels', graphCache.getLabels())
    this.set('types', graphCache.getRelationships())
    this.set('options', {
      interaction: {
        dragNodes: true, // Enables the user to drag a node. No way to pin a node onto the canvas.
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
          customScalingFunction: function (min, max, total, value) {
            if (max === min) {
              return 0
            } else {
              var scale = 1 / (max - min)
              return Math.max(0, (value - min) * scale)
            }
          }
        },
        value: 10
      },
      physics: {
        enabled: true,
        // solver: 'barnesHut',
        timestep: 0.9
      },
      layout: {
        improvedLayout: false
      }
    })
  },

  actions: {

    editModeAltClick (evt) {
      this.toggleEditMode(evt)
    },

    chooseEdgeTypeToCreate (type) {
      this.set('choice', type)
    },

    isAddingNewEdge (edge) {
      if (edge.from !== edge.to) {
        this.set('types', this.graphCache.getRelationships())
        this.rb.set('showModal', true)
        this.set('edge', edge)
      }
    },

    confirmEdgeAdd () {
      const graphCache = this.graphCache
      graphCache.addEdge(this.edge, this.choice)
      this.toggleProperty('editingEdges')
      this.rb.set('showModal', false)
      this.set('choice', 'Choose a Relationship Type...')
      this.set('types', graphCache.getRelationships())
    },

    edgeIsSelected (edge) { // Without this action, getChildNode() returns errors when an edge is selected
      if (this.editingEdges) {
        if (this.edgeDelete) {
          const graphCache = this.graphCache
          graphCache.deleteEdge(edge)
        }
      }
    },

    submit () {
      this.rb.set('showModal', false)
      this.send('confirmEdgeAdd', this.edge, this.choice)
    },

    closeModalNoEdge () {
      this.rb.set('showModal', false)
      this.set('choice', 'Choose a Relationship Type...')
    },

    doubleClickInCanvas (evt) {
      const graphCache = this.graphCache
      let pos = {
        x: evt.pointer.canvas.x,
        y: evt.pointer.canvas.y
      }
      graphCache.newNode(pos)
    },

    addCustomRelOnEnter (type, evt) {
      let choice = type.searchText.replace(/ /g, '_')
      let choiceFinal = choice.replace(/'/g, '_')
      if (evt.key === 'Enter') {
        this.set('choice', choiceFinal)
      }
    }
  }
})
