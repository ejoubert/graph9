

import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import { set } from '@ember/object';

export default Controller.extend({
  graphCache: service('graph-data-cache'),
  router: service('router'),


  types: null,
  choice: null,
  oldType: null,
  propertiesToBeDeleted: null,

  confirmPropertyDelete: false,
  confirmNodeDelete: false,
  isEditing: false,
  newProperty: false,
  newLabel: false,

  labelsToBeDeleted: null,
  labelsToAdd: null,
  labelChoice: null,
  labelTypes: null,

  nameToChange: null,


  init() {
    this._super(...arguments)
    const graphCache = this.get('graphCache');
    this.set('types', graphCache.getLabels())
    this.set('choice', this.get('model.labels'))
    this.set('labelTypes', graphCache.getLabels())
    this.set('labelChoice', this.get('model.labels'))
    this.set('propertiesToBeDeleted', [])
    this.set('labelsToBeDeleted', [])
    this.set('labelsToAdd', [])
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
      this.set('labelChoice', this.get('model.labels.firstObject'))
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
      this.get('propertiesToBeDeleted').push(key)
      delete this.get('model.properties')[key]
      this.notifyPropertyChange('model')
    },

    //Gives graphCache.save() all the node's attributes. GraphCache creates a query depending on what has been queued to change.
    //Reloads the route
    save() {
      this.set('isEditing', false)
      const graphCache = this.get('graphCache');
      let propertiesToBeDeleted = this.get('propertiesToBeDeleted')
      let labelsToBeDeleted = this.get('labelsToBeDeleted')
      let node = this.get('model')
      let oldType = this.get('oldType')
      let labelChoice = this.get('labelChoice')
      let properties = this.get('model.properties')
      let labelsToAdd = this.get('labelsToAdd')
      let nameToChange = this.get('nameToChange')
      
      graphCache.saveNode(propertiesToBeDeleted, labelsToBeDeleted, labelsToAdd, node, oldType, labelChoice, properties, nameToChange)

      .then(() => {
        this.set('propertiesToBeDeleted', [])
        this.get('router').transitionTo('visualization')  
        this.get('router').transitionTo('visualization.edit-window', this.get('model.id'))  
      })
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

    blurNewName(name) {
      this.set('nameToChange', name)

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
      this.set('isEditing', false)
    },

    //Shows two buttons. One which cancels the delete, and the other which confirms it
    deleteNode() {
      this.set('confirmNodeDelete', true)
    },

    //Sets the new label type when a choice is selected
    chooseType(type) {
      this.set('oldType', this.get('model.labels.firstObject'))
      this.set('choice', type)
    },

    //Shows/hides the power-select that allows a new type of label to be chosen from it's list
    addNewLabel() {
      this.toggleProperty('newLabel')
    },

    //When a new label is chosen, that label is immediately added into the database, the route is then reloaded
    chooseLabel(type) {
      this.set('newLabel', false)
      set(this.get('model'), 'labels', this.get('oldType'))
      if (!this.get('labelsToAdd').includes(type)) {
        this.get('labelsToAdd').push(type)
        this.get('model.labels').push(type)
        this.notifyPropertyChange('model')
      }
    },

    //When the button is clicked, that label is immediately removed from the database, the route is then reloaded
    deleteLabel(label) {
      var filteredLabel = this.get('model.labels').filter(function(e) { return e !== label })
      set(this.get('model'), 'labels', filteredLabel)
      this.get('labelsToBeDeleted').push(label)
    },

    //Loads the specific type of connection into the visualization
    reveal(key) {
      const graphCache = this.get('graphCache')
      graphCache.revealConnectedLabels(this.get('model.id'), key)
    },

    customLabel(type, e) {
      let label = type.searchText
      set(this.get('model'), 'labels', this.get('oldType'))
      if (e.key == 'Enter') {
        console.log(label)
        this.set('newLabel', false)
        this.get('labelsToAdd').push(label)
        this.get('model.labels').push(label)
        this.notifyPropertyChange('model')
      }
    }
  }
});
