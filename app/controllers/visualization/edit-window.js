import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {set} from '@ember/object';

export default Controller.extend({
  graphCache: service('graph-data-cache'),
  router: service('router'),

  types: null,
  choice: null,
  oldType: null,
  propertiesToBeDeleted: null,
  labelsToBeDeleted: null,
  labelsToAdd: null,
  labelChoice: null,
  labelTypes: null,
  nameToChange: null,
  confirmPropertyDelete: false,
  confirmNodeDelete: false,
  isEditing: false,
  newProperty: false,
  newLabel: false,
  nameEdit: false,
  noLabelsAlert: false,

  init() {
    this._super(...arguments)
    const graphCache = this.get('graphCache');
    this.set('types', graphCache.getLabels())
    this.set('choice', this.get('model.labels'))
    this.set('labelTypes', graphCache.getLabels())
    this.set('labelChoice', 'Please select a label')
    this.set('propertiesToBeDeleted', [])
    this.set('labelsToBeDeleted', [])
    this.set('labelsToAdd', [])
  },

  actions: {

    close() {
      this.get('router').transitionTo('visualization')
      this.set('nameEdit', false)
    },

    editModeEnable() {
      this.set('isEditing', true)
      this.set('choice', this.get('model.labels.firstObject'))
      this.set('oldType', this.get('model.labels'))
      this.set('labelChoice', this.get('model.labels.firstObject'))
    },

    blurKey(oldKey, value, key) {
      let properties = this.get('model.properties')
      delete properties[oldKey]
      this.set('model.properties.' + key, value)
    },

    blurValue(key, value) {
      this.set('model.properties.' + key, value)
    },

    deleteProperty() {
      this.set('confirmPropertyDelete', true)
    },

    cancelPropertyDelete() {
      this.set('confirmPropertyDelete', false)
    },

    confirmPropertyDelete(key) {
      this.set('confirmPropertyDelete', false)
      this.get('propertiesToBeDeleted').push(key)
      delete this.get('model.properties')[key]
      this.notifyPropertyChange('model')
    },

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

    newProperty() {
      this.set('newProperty', true)
    },

    closeNewProperty() {
      this.set('newProperty', false)
    },

    blurNewPropertyKey() {},

    blurNewPropertyValue(value, key) {
      this.set('model.properties.' + key.replace(/ /g, '_'), value)
      this.set('newProperty', false)
      this.set('newPropertyKey', null)
      this.set('newPropertyValue', null)

    },

    blurNewName(name) {
      this.set('nameToChange', name)
      this.set('nameEdit', false)
      const graphCache = this.get('graphCache')
      graphCache.nameChange(this.get('model.id'), name)
    },

    cancelNodeDelete() {
      this.set('confirmNodeDelete', false)
    },

    confirmNodeDelete() {
      const graphCache = this.get('graphCache')
      this.set('confirmNodeDelete', false)
      graphCache.delete(this.get('model.id'), this.get('model'))
      this.get('router').transitionTo('visualization')
      this.set('isEditing', false)
    },

    deleteNode() {
      this.set('confirmNodeDelete', true)
    },

    chooseType(type) {
      this.set('oldType', this.get('model.labels.firstObject'))
      this.set('choice', type.replace(/ /g, '_'))
    },

    addNewLabel() {
      this.toggleProperty('newLabel')
    },

    chooseLabel(type) {
      let noSpaceType = type.replace(/ /g, '_')
      let noApostrophe = noSpaceType.replace(/'+/g, '_')
      this.set('newLabel', false)
      set(this.get('model'), 'labels', this.get('oldType'))
      if (this.get('model.labels') == null) {
        this.set('model.labels', [])
      }
      if (!this.get('labelsToAdd').includes(noApostrophe)) {
        this.get('labelsToAdd').push(noApostrophe)
        this.get('model.labels').push(noApostrophe)
        this.notifyPropertyChange('model')
      }
    },

    deleteLabel(label) {
      var filteredLabel = this.get('model.labels').filter(function (e) {
        return e !== label
      })
      set(this.get('model'), 'labels', filteredLabel)
      this.get('labelsToBeDeleted').push(label)
    },

    reveal(key) {
      const graphCache = this.get('graphCache')
      graphCache.revealConnectedLabels(this.get('model.id'), key)
    },

    customLabel(type, e) {
      let label = type.searchText.replace(/ /g, '_')
      let noApostrophe = label.replace(/'+/g, '_')
      set(this.get('model'), 'labels', this.get('oldType'))
      if (e.key == 'Enter') {
        this.set('newLabel', false)
        this.get('labelsToAdd').push(noApostrophe)
        if (this.get('model.labels')) {
          this.get('model.labels').push(noApostrophe)
        } else {
          set(this.get('model'), 'labels', noApostrophe)
        }
        this.notifyPropertyChange('model')
      }
    },
    submit() {
      this.set('noLabelsAlert', false)
    }
  }
});