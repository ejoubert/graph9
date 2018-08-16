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

      let query = 'match(n) where id(n) = '+this.get('model.id')+' set n.'+key+' = null'
      const graphCache = this.get('graphCache')

      //query replacement should go here

      delete this.get('model.properties')[key]
      this.notifyPropertyChange('model')
    },
    save() {
      this.set('isEditing', false)
      const graphCache = this.get('graphCache');
      for (let i = 0; i < this.get('toBeDeleted').length; i++){
        console.log(this.get('toBeDeleted')[i])

      }
      let query = 'MATCH (n)-[r]-(m) WHERE ID(n) = '+this.get('model.id')+' REMOVE n:'+this.get('oldType')+' SET n:'+this.get('choice')+', ';
      let queryModified;
      let properties = this.get('model.properties');
      for (let key in properties) {
        query = query + 'n.'+key+'="'+properties[key]+'", ';
        queryModified = query.substring(0, query.length-2);
      }
      graphCache.remove(this.get('model'))
      this.get('neo4j.session')
      .run(queryModified+' return n')
      .then(function (result) {
        graphCache.changeNode(result)
      })
      // graphCache.saveNode(node)
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
