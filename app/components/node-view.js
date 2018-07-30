import Component from '@ember/component';
import { computed } from '@ember/object';
import {inject as service} from '@ember/service';

export default Component.extend({
  neo4j: service('neo4j-connection'),
  graphCache: service('graph-data-cache'),

  classNames: ['node-edit'],
  isEditing: false,
  confirmDelete: false,
  newProperty: false,


  actions: {
    toggleVisible(id) {
      const graphCache = this.get('graphCache');
      this.toggleProperty('isVisible')
      console.log('Opened edit window for node: ' + this.get('node.id'));
      this.get('select')()
    },
    edit() {
      this.set('isEditing', true);
    },
    save() {
      this.set('isEditing', false);
      let query = "match(n) where id(n) = "+this.get('node.id')+" SET ";
      let queryModified;
      let properties = this.get('node.properties');
      for (let key in properties) {
        query = query + 'n.'+key+'="'+properties[key]+'", ';
        queryModified = query.substring(0, query.length-2);
      }
      console.log(queryModified);
      this.get('neo4j.session')
      .run(queryModified)
      .then(function (result) {
      })
    },
    newProperty() {
      this.set('newProperty', true);
    },
    saveNewProperty() {
      let properties = this.get('node.properties');
      properties[this.get('newPropertyKey')] = this.get('newPropertyValue');
      this.set('node.properties', properties);
      this.set('newProperty', false);
    },
    deleteProperty(node, key) {
      this.set('confirmDelete', true);
    },
    confirmDelete(key) {
      let query = 'match(n) where id(n) = '+this.get('node.id')+' set n.'+key+' = null';
      console.log(query);
      this.get('neo4j.session')
      .run(query)
      .then(function (result) {
      })
      this.set('confirmDelete', false);
    },
    cancel() {
      console.log('cancelled');
      this.set('confirmDelete', false);
    },
    close() {
      this.set('isVisible', false);
    },
    seeConnections() {
      const graphCache = this.get('graphCache');
      let query = 'match (n)-[r]-(m) where id(n) = '+this.get('node.id')+' return n,m,r';
      graphCache.query(query);
    }
  }
});
