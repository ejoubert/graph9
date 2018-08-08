import Component from '@ember/component';
import {inject as service} from '@ember/service';

export default Component.extend({
  neo4j: service('neo4j-connection'),
  graphCache: service('graph-data-cache'),

  types: null,
  choice: null,
  oldType: null,

  classNames: ['node-edit'],
  isEditing: false,
  confirmPropertyDelete: false,
  newProperty: false,
  confirmNodeDelete: false,
  nodeType: null,



  init() {
    this._super(...arguments)
    const graphCache = this.get('graphCache');
    this.set('types', graphCache.getLabels())
    this.set('choice', this.get('node.labels'))
    this.set('oldType', this.get('node.labels'))
  },

  actions: {
    //Toggle Editing Window =====
    toggleVisible() {
      this.get('select')()
      this.set('choice', this.get('node.labels.firstObject'))
      this.set('isVisible', true)
    },
    close() {
      this.toggleProperty('isVisible')
    },
    //Reveal connecting Nodes ===== 
    seeConnections() {
      const graphCache = this.get('graphCache');
      let query = 'match (n)-[r]-(m) where id(n) = '+this.get('node.id')+' return n,m,r limit 100';
      graphCache.query(query);
    },
    //Enables editing mode ===== 
    editModeEnable() {
      this.set('isEditing', true);
    },
    //Delete Properties =======
    deleteProperty() {
      this.set('confirmPropertyDelete', true);
    },
    confirmPropertyDelete(key) {
      let query = 'match(n) where id(n) = '+this.get('node.id')+' set n.'+key+' = null';
      this.get('neo4j.session')
      .run(query)
      .then(function () {
      })
      this.set('confirmPropertyDelete', false);
      let properties = this.get('node.properties')
      delete properties[key]
    },
    //Adds a new property ======
    newProperty() {
      this.set('newProperty', true);
    },
    //Save all properties via neo4j query
    saveAllProperties() {
      this.set('isEditing', false);
      const graphCache = this.get('graphCache');
      let query = 'MATCH (n) WHERE ID(n) = '+this.get('node.id')+' REMOVE n:'+this.get('oldType')+' SET n:'+this.get('choice')+', ';
      let queryModified;
      let properties = this.get('node.properties');
      for (let key in properties) {
        query = query + 'n.'+key+'="'+properties[key]+'", ';
        queryModified = query.substring(0, query.length-2);
      }
      graphCache.remove(this.get('node'))
      this.get('neo4j.session')
      .run(queryModified+' return n')
      .then(function (result) {
        graphCache.changeNode(result)
      })
      this.toggleProperty('isVisible')
    },

    //Deletes the node
    deleteNode() {
      this.set('confirmNodeDelete', true)
    },
    confirmNodeDelete(node) {
      let query = 'MATCH(n) where id(n) = '+node.id+' detach delete n'
      this.get('neo4j.session')
      .run(query)
      .then(function () {
      })
      const graphCache = this.get('graphCache')
      graphCache.remove(node)
    },
    cancelNodeDelete() {
      this.set('confirmNodeDelete', false)
    },
    cancel() {
      this.set('confirmPropertyDelete', false);
    },
    blurValue(key, value) {
      this.set('node.properties.'+key, value);
    },
    blurKey(oldKey, value, key) {
      let properties = this.get('node.properties')
      delete properties[oldKey]
      this.set('node.properties.'+key, value)
    },
    blurNewPropertyKey(value, key) {
      this.set('node.properties.'+key, value)
    },
    blurNewPropertyValue(value, key) {
      this.set('node.properties.'+key, value)
      this.set('newProperty', false)
    },
    closeNewProperty() {
      this.set('newProperty', false)
    },
    chooseType(type) {
      this.set('oldType', this.get('node.labels.firstObject'))
      this.set('choice', type)
    },
    double() {
      const graphCache = this.get('graphCache');
      let query = 'match (n)-[r]-(m) where id(n) = '+this.get('node.id')+' return n,m,r limit 100';
      graphCache.query(query);
    }
  }
});
