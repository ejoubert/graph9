import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  neo4j: service('neo4j-connection'),
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
    close(){
      this.get('router').transitionTo('visualization')
    },
    editModeEnable() {
      this.set('isEditing', true)
      this.set('choice', this.get('model.labels.firstObject'))
      this.set('oldType', this.get('model.labels'))
    },
    blurKey(oldKey, value, key) {
      let properties = this.get('model.properties')
      delete properties[oldKey]
      this.set('model.properties.'+key, value)
    },
    blurValue(key, value) {
      this.set('model.properties.'+key, value)
    },
    deleteProperty() {
      this.set('confirmPropertyDelete', true)
    },
    cancelPropertyDelete() {
      this.set('confirmPropertyDelete', false)
    },
    confirmPropertyDelete(key) {
      this.set('confirmPropertyDelete', false)
      this.get('toBeDeleted').push(key)

      delete this.get('model.properties')[key]
      this.notifyPropertyChange('model')
    },
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
    newProperty() {
      console.log('new property')
      this.set('newProperty', true)
    },
    closeNewProperty() {

    },
    blurNewPropertyKey(value, key) {
      this.set('model.properties.'+key, value)
    },
    blurNewPropertyValue(value, key) {
      this.set('model.properties.'+key, value)
      this.set('newProperty', false)
    },
    cancelNodeDelete() {
      this.set('confirmNodeDelete', false)
    },
    confirmNodeDelete() {
      const graphCache = this.get('graphCache')
      this.set('confirmNodeDelete', false)
      graphCache.delete(this.get('model.id'), this.get('model'))
      this.get('router').transitionTo('visualization')
    },
    deleteNode() {
      this.set('confirmNodeDelete', true)
    },
    chooseType(type) {
      this.set('oldType', this.get('model.labels.firstObject'))
      this.set('choice', type)
    }
  }
});
