import Component from '@ember/component';
import {inject as service} from '@ember/service';

export default Component.extend({
  graphCache: service('graph-data-cache'),
  rb: service('relationship-builder'),
  router: service('router'),

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

  init() {
    this._super(...arguments)
    const graphCache = this.get('graphCache')
    this.set('labels', graphCache.getLabels())
    this.set('types', graphCache.getRelationships())
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
          customScalingFunction: function (min, max, total, value) {
            if (max === min) {
              return 0;
            } else {
              var scale = 1 / (max - min);
              return Math.max(0, (value - min) * scale);
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

    toggleEditMode(evt) {
      if (evt.altKey) {
        this.toggleProperty('editingEdges')
      }
    },

    toggleEditingEdges() {
      this.toggleProperty('editingEdges')
    },

    startSearchByLoadingLabels() {
      const graphCache = this.get('graphCache');
      let promise = new Promise((resolve) => {
        let labels = graphCache.getLabels()
        resolve(labels)
      })
      this.toggleProperty('searching')
      promise.then((value) => {
        this.set('labels', value)
      })
      this.set('types', graphCache.getRelationships())
    },

    clearNodesFromCanvas() {
      const graphCache = this.get('graphCache')
      graphCache.empty()
      this.get('router').transitionTo('visualization')
    },

    useLabelToChooseProperty(type) {
      const graphCache = this.get('graphCache');
      let promise = new Promise((resolve) => {
        let properties = graphCache.getProperties(type)
        resolve(properties)
      })
      this.set('labelIsChosen', true)
      promise.then((value) => {
        this.set('properties', value)
      })
      this.set('labelChoice', type)
    },

    usePropertyToSearch(type) {
      this.set('propertyIsChosen', true)
      this.set('propertyChoice', type)
    },

    searchForNodes(value) {
      const graphCache = this.get('graphCache')
      let label = this.get('labelChoice')
      let property = this.get('propertyChoice')
      if (value) {
        this.set('noName', false)
        
        graphCache.search(value, label, property)
        this.set('labelIsChosen', false)
        this.set('propertyIsChosen', false)
        this.set('searching', false)
        this.set('labelChoice', 'Choose a label type to begin')
        this.set('propertyChoice', 'Choose a property type to continue')
        this.set('noName', false)
        this.set('searchValue', null)
      } else {
        this.set('noName', true)
      }
    },

    chooseEdgeTypeToCreate(type) {
      this.set('choice', type)
    },

    isAddingNewEdge(edge) {
      if (edge.from != edge.to) {
        this.get('rb').set('showModal', true)
        this.set('edge', edge)
      }
    },

    confirmEdgeAdd() {
      const graphCache = this.get('graphCache');
      graphCache.addEdge(this.edge, this.choice)
      this.toggleProperty('editingEdges')
      this.get('rb').set('showModal', false)
      this.set('choice', "Choose a Relationship Type...")
      this.set('types', graphCache.getRelationships())
    },

    edgeIsSelected() { // Without this action, getChildNode() returns errors when an edge is selected
    },

    submit() {
      this.get('rb').set('showModal', false)
      this.send('confirmEdgeAdd', this.get('edge'), this.get('choice'))
    },

    closeModalNoEdge() {
      this.get('rb').set('showModal', false)
      this.set('choice', "Choose a Relationship Type...")
    },

    doubleClickInCanvas(evt) {
      const graphCache = this.get('graphCache')
      let pos = {
        x: evt.pointer.canvas.x,
        y: evt.pointer.canvas.y
      }
      graphCache.newNode(pos)
    },

    addCustomRelOnEnter(type, evt) {
      let choice = type.searchText.replace(/ /g, '_')
      let choiceFinal = choice.replace(/'/g, '_')
      if (evt.key == 'Enter') {
        this.set('choice', choiceFinal)
      }
    }
  }
});
