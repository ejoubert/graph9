import Component from '@ember/component';
import {inject as service} from '@ember/service';
// import {computed} from '@ember/object';

export default Component.extend({
  graphCache: service('graph-data-cache'),
  router: service('router'),

  editingEdges: false,


  actions : {

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
      this.set('labelIsChosen', false)
      this.set('propertyIsChosen', false)
      this.set('searchQuery', null)
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
      this.set('propertyChoice', null)
      this.set('propertyIsChosen', false)
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
        
      graphCache.search(value.searchQuery, this.labelChoice, this.propertyChoice)
      this.set('labelIsChosen', false)
      this.set('propertyIsChosen', false)
      this.set('searching', false)
      this.set('searchQuery', null)
    },
  }
})