import Component from '@ember/component'
import { inject as service } from '@ember/service'

export default Component.extend({
  // nodes: ['node1', 'node2'],
  // edges: ['edge1', 'edge2'],

  graphCache: service('graph-data-cache'),
  router: service(),

  editingEdges: false,

  actions: {

    toggleEditMode (evt) {
      if (evt.altKey) {
        this.toggleProperty('editingEdges')
      }
    },

    toggleEditingEdges () {
      this.toggleProperty('editingEdges')
    },

    edgeDelete () {
      this.toggleProperty('edgeDelete')
    },

    startSearchByLoadingLabels () {
      const graphCache = this.graphCache
      let promise = new Promise((resolve) => {
        let labels = graphCache.getLabels()
        resolve(labels)
      })
      this.toggleProperty('searching')
      this.set('labelIsChosen', false)
      this.set('propertyIsChosen', false)
      this.set('searchQuery', null)
      promise.then((value) => {
        this.set('labels', value)
      })
      this.set('types', graphCache.getRelationships())
    },

    clearNodesFromCanvasConfirm () {
      const graphCache = this.graphCache
      graphCache.empty()
      this.router.transitionTo('visualization')
      this.set('clearingCanvas', false)
    },

    cancelClearCanvas () {
      this.set('clearingCanvas', false)
    },

    clearCanvasCheck () {
      this.set('clearingCanvas', true)
    },

    useLabelToChooseProperty (type) {
      const graphCache = this.graphCache
      let promise = new Promise((resolve) => {
        let properties = graphCache.getProperties(type)
        resolve(properties)
      })
      this.set('labelIsChosen', true)
      this.set('propertyChoice', null)
      this.set('propertyIsChosen', false)
      promise.then((value) => {
        this.set('properties', value)
      })
      this.set('labelChoice', type)
    },

    usePropertyToSearch (type) {
      this.set('propertyIsChosen', true)
      this.set('propertyChoice', type)
    },

    searchForNodes (value) {
      const graphCache = this.graphCache

      graphCache.search(value.searchQuery, this.labelChoice, this.propertyChoice)
      this.set('labelIsChosen', false)
      this.set('propertyIsChosen', false)
      this.set('searching', false)
      this.set('searchQuery', null)
    }
  }
})
