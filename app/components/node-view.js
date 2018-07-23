import Component from '@ember/component';
import { computed } from '@ember/object';
import {inject as service} from '@ember/service';

export default Component.extend({
  neo4j: service('neo4j-connection'),
  classNames: ['node-edit'],
  isVisible: false,
  isEditing: false,
  newProperty: false,
  actions: {
    toggleVisible() {
      this.toggleProperty('isVisible')
    },
    edit() {
      this.set('isEditing', true)
    },
    save() {
      this.set('isEditing', false)
      let query = "match(n) where id(n) = "+this.get('model.id')+" SET "
      let queryModified;
      let properties = this.get('model.properties')
      for (let key in properties) {
        query = query + 'n.'+key+'="'+properties[key]+'", '
        queryModified = query.substring(0, query.length-2)
      }
      this.get('neo4j.session')
      .run(queryModified)
      .then(function (result) {
      })
    },
    newProperty() {
      this.set('newProperty', true)
      let propertyId=this.get('model.propertyTypes').length
      this.set('model.properties.property'+propertyId, this.get('model.properties.property'+propertyId))
      this.set('model.propertyTypes', this.get('model.propertyTypes').concat(['newkey_'+propertyId]))
    },
    deleteProperty(pt) {
      let query = 'match(n) where id(n) = '+this.get('model.id')+' set n.'+pt+' = null'
      this.get('neo4j.session')
      .run(query)
      .then(function (result) {
      })
    },
    close() {
      this.set('isVisible', false)
    }
  }
});
