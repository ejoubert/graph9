import Controller from '@ember/controller'
import { inject as service } from '@ember/service'
import { set, computed } from '@ember/object'
import { htmlSafe } from '@ember/template'

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

  init () {
    this._super(...arguments)
    const graphCache = this.graphCache
    this.set('types', graphCache.getLabels())
    this.set('choice', this.get('model.labels'))
    this.set('labelTypes', graphCache.labelTypes)
    this.set('labelChoice', 'Please select a label')
    this.set('propertiesToBeDeleted', [])
    this.set('labelsToBeDeleted', [])
    this.set('labelsToAdd', [])
  },

  labelChoices: computed('labelTypes.[]', 'model.labels.[]', function () {
    let labels = this.labelTypes
    return labels.filter(function (e) { return this.indexOf(e) < 0 }, this.model.labels)
  }),

  badgeColor: computed('model', function () {
    return htmlSafe('background-color: ' + this.model.color)
  }),

  actions: {

    selectLabel (label) {
      this.labelsToAdd.push(label)
      set(this.model, 'labels', this.labelsToAdd)
      this.notifyPropertyChange('model')
    },

    removeLabel (label) {
      this.labelsToAdd.splice(this.labelsToAdd.indexOf(label), 1)
      this.labelsToBeDeleted.push(label)
      set(this.model, 'labels', this.labelsToAdd)
      this.notifyPropertyChange('model')
    },

    newLabel () {
      this.toggleProperty('customLabel')
    },

    submitNewLabel (label) {
      this.set('customLabel', false)
      let noSpaceType = label.addingNewLabel.replace(/ /g, '_')
      let noApostrophe = noSpaceType.replace(/'+/g, '_')
      let noSpecialChars = noApostrophe.replace(/[^a-zA-Z0-9 ]/g, '')
      this.labelsToAdd.push(noSpecialChars)
      this.labelTypes.push(noSpecialChars)
      set(this.model, 'labels', this.labelsToAdd)
      this.set('addingNewLabel', null)
      this.notifyPropertyChange('model')
    },

    close () {
      this.router.transitionTo('visualization')
      this.set('nameEdit', false)
    },

    editModeEnable () {
      this.set('isEditing', true)
      this.set('choice', this.get('model.labels.firstObject'))
      this.set('oldType', this.get('model.labels'))
      this.set('labelChoice', this.get('model.labels.firstObject'))
    },

    blurKey (oldKey, value, key) {
      let properties = this.get('model.properties')
      delete properties[oldKey]
      this.set('model.properties.' + key, value)
    },

    blurValue (key, value) {
      this.set('model.properties.' + key, value)
    },

    deleteProperty () {
      this.set('confirmPropertyDelete', true)
    },

    cancelPropertyDelete () {
      this.set('confirmPropertyDelete', false)
    },

    confirmPropertyDelete (key) {
      this.set('confirmPropertyDelete', false)
      this.propertiesToBeDeleted.push(key)
      delete this.get('model.properties')[key]
      this.notifyPropertyChange('model')
    },

    save () {
      this.set('isEditing', false)
      const graphCache = this.graphCache
      let propertiesToBeDeleted = this.propertiesToBeDeleted
      let labelsToBeDeleted = this.labelsToBeDeleted
      let node = this.model
      let oldType = this.oldType
      let labelChoice = this.labelChoice
      let properties = this.get('model.properties')
      let labelsToAdd = this.labelsToAdd
      let nameToChange = this.nameToChange
      graphCache.saveNode(propertiesToBeDeleted, labelsToBeDeleted, labelsToAdd, node, oldType, labelChoice, properties, nameToChange)
        .then(() => {
          this.set('propertiesToBeDeleted', [])
          this.router.transitionTo('visualization')
          this.router.transitionTo('visualization.edit-window', this.get('model.id'))
          this.set('propertiesToBeDeleted', [])
          this.set('labelsToBeDeleted', [])
          this.set('labelsToAdd', [])
          this.set('nameToChange', null)
        })
    },

    newProperty () {
      this.set('newProperty', true)
    },

    closeNewProperty () {
      this.set('newProperty', false)
    },

    blurNewPropertyKey () {},

    blurNewPropertyValue (value, key) {
      this.set('model.properties.' + key.replace(/ /g, '_'), value)
      this.set('newProperty', false)
      this.set('newPropertyKey', null)
      this.set('newPropertyValue', null)
    },

    blurNewName (name) {
      this.set('nameToChange', name)
      this.set('nameEdit', false)
      const graphCache = this.graphCache
      graphCache.nameChange(this.get('model.id'), name)
    },

    cancelNodeDelete () {
      this.set('confirmNodeDelete', false)
    },

    confirmNodeDelete () {
      const graphCache = this.graphCache
      this.set('confirmNodeDelete', false)
      graphCache.delete(this.get('model.id'), this.model)
      this.router.transitionTo('visualization')
      this.set('isEditing', false)
    },

    deleteNode () {
      this.set('confirmNodeDelete', true)
    },

    chooseType (type) {
      this.set('oldType', this.get('model.labels.firstObject'))
      this.set('choice', type.replace(/ /g, '_'))
    },

    addNewLabel () {
      this.toggleProperty('newLabel')
    },

    chooseLabel (type) {
      let noSpaceType = type.replace(/ /g, '_')
      let noApostrophe = noSpaceType.replace(/'+/g, '_')
      this.set('newLabel', false)
      set(this.model, 'labels', this.oldType)
      if (this.get('model.labels') == null) {
        this.set('model.labels', [])
      }
      if (!this.labelsToAdd.includes(noApostrophe)) {
        this.labelsToAdd.push(noApostrophe)
        this.get('model.labels').push(noApostrophe)
        this.notifyPropertyChange('model')
      }
    },

    deleteLabel (label) {
      var filteredLabel = this.get('model.labels').filter(function (e) {
        return e !== label
      })
      set(this.model, 'labels', filteredLabel)
      this.labelsToBeDeleted.push(label)
    },

    reveal (key) {
      const graphCache = this.graphCache
      graphCache.revealConnectedLabels(this.get('model.id'), key)
    },

    customLabel (type, e) {
      let label = type.searchText.replace(/ /g, '_')
      let noApostrophe = label.replace(/'+/g, '_')
      set(this.model, 'labels', this.oldType)
      if (e.key === 'Enter') {
        this.set('newLabel', false)
        this.labelsToAdd.push(noApostrophe)
        if (this.get('model.labels')) {
          this.get('model.labels').push(noApostrophe)
        } else {
          set(this.model, 'labels', noApostrophe)
        }
        this.notifyPropertyChange('model')
      }
    },
    submit () {
      this.set('noLabelsAlert', false)
    }
  }
})
