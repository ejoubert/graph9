import Component from '@ember/component'
import { inject as service } from '@ember/service'
import { computed } from '@ember/object'
import { schedule } from '@ember/runloop'

export default Component.extend({
  dataCache: service('dataCache'),
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

  nodes: computed('model.@each', 'model.[]', 'graphCache.items.[]', function () {
    return this.graphCache.items
    // return this.model
  }),

  init () {
    this._super(...arguments)
    const dataCache = this.dataCache
    this.set('labels', dataCache.getLabels())
    this.set('types', dataCache.getRelationships())
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
        this.set('types', this.dataCache.getRelationships())
        this.rb.set('showModal', true)
        this.set('edge', edge)
      }
    },

    confirmEdgeAdd () {
      const dataCache = this.dataCache
      dataCache.addEdge(this.edge, this.choice)
      this.toggleProperty('editingEdges')
      this.rb.set('showModal', false)
      this.set('choice', 'Choose a Relationship Type...')
      this.set('types', dataCache.getRelationships())
    },

    edgeIsSelected (edge) { // Without this action, getChildNode() returns errors when an edge is selected
      if (this.editingEdges) {
        if (this.edgeDelete) {
          const dataCache = this.dataCache
          dataCache.deleteEdge(edge)
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
      const dataCache = this.dataCache
      let pos = {
        x: evt.pointer.canvas.x,
        y: evt.pointer.canvas.y
      }
      dataCache.newNode(pos)
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
