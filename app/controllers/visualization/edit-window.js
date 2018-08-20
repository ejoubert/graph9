

import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  graphCache: service('graph-data-cache'),
  router: service('router'),


  types: null,
  choice: null,
  oldType: null,
  toBeDeleted: null,

  confirmPropertyDelete: false,
  confirmNodeDelete: false,
  isEditing: false,
  newProperty: false,


  init() {
    this._super(...arguments)
    const graphCache = this.get('graphCache');
    this.set('types', graphCache.getLabels())
    this.set('choice', this.get('model.labels'))
    this.set('toBeDeleted', [])
  },

  actions: {
    
    //"Closes" editing window, by returning the visualization route
    close() {
      this.get('router').transitionTo('visualization')
    },

    //Allows editing of node properties
    editModeEnable() {
      this.set('isEditing', true)
      this.set('choice', this.get('model.labels.firstObject'))
      this.set('oldType', this.get('model.labels'))
    },

    //Overwrites the property key when focus leaves the key input field
    blurKey(oldKey, value, key) {
      let properties = this.get('model.properties')
      delete properties[oldKey]
      this.set('model.properties.'+key, value)
    },

    //Overwrites the property value when focus leaves the value input field
    blurValue(key, value) {
      this.set('model.properties.'+key, value)
    },

    //Sets confirmPropertyDelete to true, which reveals two buttons. One confirms deleting the property, the other cancels
    deleteProperty() {
      this.set('confirmPropertyDelete', true)
    },

    //Cancels property delete, and hides this button
    cancelPropertyDelete() {
      this.set('confirmPropertyDelete', false)
    },

    //Confirms property delete and hides this button. Pushes properties to be deleted into an array which is later used to set these properties to null
    confirmPropertyDelete(key) {
      this.set('confirmPropertyDelete', false)
      this.get('toBeDeleted').push(key)
      delete this.get('model.properties')[key]
      this.notifyPropertyChange('model')
    },

    //Saves the node's properties, while removing the properties to be deleted
    save() {
      this.set('isEditing', false)
      const graphCache = this.get('graphCache');
      let toBeDeleted = this.get('toBeDeleted')
      let node = this.get('model')
      let oldType = this.get('oldType')
      let choice = this.get('choice')
      let properties = this.get('model.properties')
      graphCache.saveNode(toBeDeleted, node, oldType, choice, properties)
      graphCache.remove(this.get('model'))
    },

    //Shows two input boxes which allow new properties to be created
    newProperty() {
      this.set('newProperty', true)
    },

    //Cancels the creation of a new property
    closeNewProperty() {
    },

    //Creates a new property using the key when focus leaves input box
    blurNewPropertyKey(value, key) {
      this.set('model.properties.'+key, value)
    },

    //Sets the value of the newly created key when focus leaves input box
    blurNewPropertyValue(value, key) {
      this.set('model.properties.'+key, value)
      this.set('newProperty', false)
    },

    //Cancels the node delete action
    cancelNodeDelete() {
      this.set('confirmNodeDelete', false)
    },

    //Deletes the node from the database, and removes it from the visualization
    confirmNodeDelete() {
      const graphCache = this.get('graphCache')
      this.set('confirmNodeDelete', false)
      graphCache.delete(this.get('model.id'), this.get('model'))
      this.get('router').transitionTo('visualization')
    },

    //Shows two buttons. One which cancels the delete, and the other which confirms it
    deleteNode() {
      this.set('confirmNodeDelete', true)
    },

    //Sets the new label type when a choice is selected
    chooseType(type) {
      this.set('oldType', this.get('model.labels.firstObject'))
      this.set('choice', type)
    }
  }
});
