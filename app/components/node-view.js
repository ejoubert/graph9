import Component from '@ember/component';
import {inject as service} from '@ember/service';
import { set } from '@ember/object';


export default Component.extend({
  neo4j: service('neo4j-connection'),
  graphCache: service('graph-data-cache'),
  router: service('router'),

  options: null,

  types: null,
  choice: null,
  oldType: null,

  classNames: ['node-edit'],
  isEditing: false,
  confirmPropertyDelete: false,
  newProperty: false,
  confirmNodeDelete: false,
  isHovering: false,

  init() {
    this._super(...arguments)
    const graphCache = this.get('graphCache');
    this.set('types', graphCache.getLabels())
    this.set('choice', this.get('node.labels'))
    this.set('oldType', this.get('node.labels'))
  },

  actions: {
    selectNode(id) {
      this.get('router').transitionTo('visualization.edit-window', id)
    },

    //Toggle Editing Window =====
    toggleVisible() {
      this.get('select')()
      this.set('choice', this.get('node.labels.firstObject'))
      this.set('isVisible', true)
      const graphCache = this.get('graphCache');
      let query = 'MATCH(n)-[r]-(m) where id(n) = '+this.get('node.id')+' return keys(m), n,m,r'
      let labelMap = {}
      let relationshipMap = {}
      let node = this.get('node')
      return this.get('neo4j.session')
      .run(query)
      .then(function (result) {
        
        for (var i = 0; i < result.records.length; i++) {

              //Counts the number of relationships and labels connected to a node
              let m = result.records[i].toObject().m
              let r = [result.records[i].toObject().r.type]

              //Labels
              for (let j = 0; j < m.labels.length; j++) {
                if (labelMap[m.labels[j]] === undefined ) {
                  labelMap[m.labels[j]] = 0
                }
                labelMap[m.labels[j]]++
              }

              //Relationships
              for (let k = 0; k < r.length; k++) {
                if (relationshipMap[r[k]] === undefined ) {
                  relationshipMap[r[k]] = 0
                }
                relationshipMap[r[k]]++
              }
        }
      })
      .then(function(){
        set(node, 'labelCount', labelMap)
        set(node, 'relationshipCount', relationshipMap)
      })
    },
    close() {
      this.set('node.isVisible', false)
    },
    //Reveal connecting Nodes ===== 
    seeConnections() {
      const graphCache = this.get('graphCache');
      let query = 'match (n)-[r]->(m) where id(n) = '+this.get('node.id')+' return n,m,r limit 100';
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
      let query = 'match (n)-[r]-(m) where id(n) = '+this.get('node.id')+' return n,m,r limit 200';
      graphCache.query(query);
    },
    focusNode(nodeId) {
      this.set('isHovering', true)
      this.parentView.nodes.update({id: nodeId, value: 15});
    },
    blur(nodeId) {
      this.set('isHovering', false)
      this.parentView.nodes.update({id: nodeId, value: 10});

    }
  }
});
