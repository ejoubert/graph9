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
        console.log(this.editingEdges)
      }
    },
    
    toggleEditingEdges() {
      this.toggleProperty('editingEdges')
      console.log(this.editingEdges)
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
  }
})