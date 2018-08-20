import Service from '@ember/service';
import {inject as service} from '@ember/service';
import { set } from '@ember/object';

export default Service.extend({
  neo4j: service('neo4j-connection'),
  graphCache: service('graph-data-cache'),
  items: null,
  isSelected: null,
  labelTypes: null,

  init() {
    this._super(...arguments)
    this.set('items', []);
    this.set('labelTypes', ['Ideal_Opera', 'Opera_Performance', 'Place', 'Person', 'Troupe', 'Journal', 'Secondary_Source', 'New_Node'])
  },

  add(item) {
    // If the id of the new item does not exist in the array, add it to the array
    let array = this.get('items')
    if (!array.isAny('id',item.id)) {
      this.get('items').pushObject(item);
    }
  },

  remove(item) {
    this.get('items').removeObject(item);
  },

  empty() {
    this.get('items').clear();
  },

  getLabels() {
    return this.get('labelTypes')
  },

  saveNode(toBeDeleted, node, oldType, choice, properties) {
    let query
    let queryModified;
    let queryFinal
    let clauses = []
    let setNull = []

    //If there are properties to add or remove
    if (Object.keys(properties).length > 0 || toBeDeleted.length > 0) {
      query = 'MATCH (n)-[r]-(m) WHERE ID(n) = '+node.id+' REMOVE n:'+oldType+' SET n:'+choice+' ';

      for (let i = 0; i < toBeDeleted.length; i++) {
        setNull.push(' set n.'+toBeDeleted[i]+' =  null')
      }

      for (let key in properties) {
          clauses.push('set n.'+key+'="'+properties[key]+'" ')
      }

      queryModified = clauses.join(' ')
      queryFinal = query + queryModified + setNull.join(' ') + 'return n,m,r'
      
    //There are no properties, check if node has relationships
    } else {

      //if node has no connections, return only node(n)
      if (Object.keys(node.relationshipCount).length == 0){
        queryFinal = 'Match(n) where id(n) = '+node.id+' remove n:'+oldType+' set n:'+choice+' return n'  
      //if node has relationships, return node(n) and connections(m,r)
      } else {
        console.log('returning connections')
        queryFinal = 'Match(n)-[r]-(m) where id(n) = '+node.id+' remove n:'+oldType+' set n:'+choice+' return n,m,r'
      }
    }

    console.log(queryFinal)
    const exec = this.query(queryFinal)
    return exec
  },

  newNode(pos) {
    const graphCache = this.get('graphCache')
    let query = 'create (n:New_Node) return n';
    return this.get('neo4j.session')
    .run(query)
    .then((result) => {
      for (let i = 0; i < result.records.length; i++) {
        let keys = Object.keys(result.records[i].toObject())
        for (let j = 0; j < keys.length; j++) {
          let obj = result.records[i].toObject()[keys[j]]
          let newObj;
          newObj = {
            name: obj.labels[0],
            id: obj.identity.low,
            isNode: true,
            properties: obj.properties,
            labels: obj.labels,
            color: 'lightblue',
            isVisible: false,
            clusterId: 0,
            posX: pos.x,
            posY: pos.y
          }
          graphCache.add(newObj)
          }
        }
    })
  },

  labelCount(id, node) {
    let query = 'Match(n)-[r]-(m) where id(n) = '+id+' return n,m,r'
    let labelMap = {}
    let relationshipMap = {}

    return this.get('neo4j.session')
    .run(query)
    .then((result) => {

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

  formatNodes(result) {
      const graphCache = this.get('graphCache')
      let Ideal_Opera = this.get('labelTypes')[0]
      let Opera_Performance = this.get('labelTypes')[1]
      let Place = this.get('labelTypes')[2]
      let Person = this.get('labelTypes')[3]
      let Troupe = this.get('labelTypes')[4]
      let Journal = this.get('labelTypes')[5]
      let Secondary_Source = this.get('labelTypes')[6]

      
      for (let i = 0; i < result.records.length; i++) {        



          // console.log(labelMap)
          // console.log(relationshipMap)

        //Assigns different names and colours depending on the type of label
        let keys = Object.keys(result.records[i].toObject())

        for (let j = 0; j < keys.length; j++) {
          if (/keys\(/.exec(keys[j])) {
            // this key is a key key; we can ignore it.
          } else {
            // this key is actually an object being returned from neo4j
            let obj = result.records[i].toObject()[keys[j]]

            // figure out what our "name" property will be, based on the node label
            // TODO: I'm just looking at the first in the list of labels, but I should check all the labels for a node.
            // But this code is only going to last until the database has been refactored to include a 'name' property.
            let name = '<invalid>';
            let nodeColor;
            let isNode;
            let clusterId;
            if (obj.labels) {
              isNode = true;
              switch(obj.labels[0]) {
                case Person:
                  name = 'Composer: '+obj.properties.Composer;
                  nodeColor = '#A199FF';
                  clusterId = 1
                  break;
                case Ideal_Opera:
                  name = obj.properties.Ideal_Opera;
                  nodeColor = '#FF9BC6';
                  clusterId = 2
                  break;
                case Journal:
                  name = obj.properties.Journal+' pg. '+ obj.properties.Page;
                  nodeColor = '#FFE5E5';
                  clusterId = 3
                  break;
                case Opera_Performance:
                  name = obj.properties.Original_Title+' // '+obj.properties.Date;
                  nodeColor = '#BE99FF';
                  clusterId = 4
                  break;
                case Place:
                  name = obj.properties.City;
                  nodeColor = '#E2FFF4';
                  clusterId = 5
                  break;
                case Secondary_Source:
                  name = 'Sec_Src: '+obj.properties.Secondary_Source+ ' pg. '+obj.properties.Page;
                  nodeColor = 'lightgreen';
                  clusterId = 6
                  break;
                case Troupe:
                  name = 'Troupe: '+obj.properties.Troupe;
                  nodeColor = 'red';
                  clusterId = 7
                  break;
                default:
                  name = "New Node";
                  nodeColor = 'lightblue'
                  clusterId = 0
                  obj.labels = obj.labels
              }
            } else {
              isNode = false;
            }
            let newObj;
            
            if (isNode) {
              newObj = {
                name: name,
                id: obj.identity.low,
                isNode: isNode,
                properties: obj.properties,
                labels: obj.labels,
                color: nodeColor,
                isVisible: false,
                cId: clusterId,
                relationshipCount: {},
                labelCount: {}
              }
            } else {
              newObj = {
                name: obj.type,
                id: obj.identity.low,
                isNode: isNode,
                start: obj.start.low,
                end: obj.end.low
              }
            } 
            graphCache.add(newObj)
          }
        }
      }
      return;
  },

  changeNode(result) {
    const format = this.formatNodes(result)
    return format
  },
  
  query(query) {
    return this.get('neo4j.session')
    .run(query)
    .then((result) => {
      const format = this.formatNodes(result)
      return format
    })
  },

  delete(id, node) {
    let query = 'Match(n) where id(n) = '+id+' detach delete n'
    return this.get('neo4j.session')
    .run(query)
    .then((result) =>{
      const remove = this.remove(node)
      return remove
    })
  }
});
