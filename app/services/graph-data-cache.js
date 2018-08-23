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

  saveNode(propertiesToBeDeleted, labelsToBeDeleted, labelsToAdd, node, oldType, labelChoice, properties, newName) {
    let query
    let clauses = []
    let queryBase = 'MATCH(n) WHERE ID(n) = '+node.id
    let queryEnd

    for (let key in properties) {
        clauses.push(' SET n.'+key+'="'+properties[key]+'" ')
    }

    if (newName != null) {
      queryEnd = ' SET n.Name ="'+newName+'" RETURN n'
    } else {
      queryEnd = ' RETURN n'

    }

    // let addName = 'SET n.name = "'+newName+'" '
    let updateProperties = clauses.join('')
    let deleteLabels = ' REMOVE n:'+labelsToBeDeleted.join(' REMOVE n:')
    let deleteProperties = 'SET n.'+propertiesToBeDeleted.join(' = null SET n.') + ' = null '
    let addLabels = 'SET n:'+labelsToAdd.join(' SET n:')

    // properties and labels to be deleted, and labels to be added
    if (deleteProperties.length > 14 && deleteLabels.length > 10 && addLabels.length > 6) {
      query = queryBase + updateProperties + deleteProperties + addLabels + deleteLabels + queryEnd

    //properties and labels to be deleted  
    } else if (deleteProperties.length > 14 && deleteLabels.length > 10) {
      query = queryBase + updateProperties + deleteProperties + deleteLabels + queryEnd

    //properties to be deleted, and labels to be added
    } else if (deleteProperties.length > 14 && addLabels.length > 6) {
      query = queryBase + updateProperties + deleteProperties + addLabels + queryEnd

    //delete and add labels
    } else if (deleteLabels.length > 10 && addLabels.length > 6) {
      query = queryBase + updateProperties + addLabels + deleteLabels + queryEnd

    //delete labels
    } else if (deleteLabels.length > 10) {
      query = queryBase + updateProperties + deleteLabels + queryEnd

    //adding labels
    } else if (addLabels.length > 6) {
      query = queryBase + updateProperties + addLabels + queryEnd

    //deleting properties
    } else if (deleteProperties.length > 14) {
      query = queryBase + updateProperties + deleteProperties + queryEnd

    //updating properties. This option is chosen by default when labels and properties were not added or removed
    } else {
      query = queryBase + updateProperties + queryEnd
    }
    
    const exec = this.query(query)
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
            let name = obj.properties.Name;
            let nodeColor;
            let isNode;
            let clusterId;
            let properties = obj.properties
            delete properties['Name']
            if (obj.labels) {
              isNode = true;
              switch(obj.labels[0]) {
                case Person:
                  // name = 'Composer: '+obj.properties.Composer;
                  // name = obj.properties.Name
                  nodeColor = '#A199FF';
                  clusterId = 1
                  break;
                case Ideal_Opera:
                  // name = obj.properties.Ideal_Opera;
                  nodeColor = '#FF9BC6';
                  clusterId = 2
                  break;
                case Journal:
                  // name = obj.properties.Journal+' pg. '+ obj.properties.Page;
                  nodeColor = '#FFE5E5';
                  clusterId = 3
                  break;
                case Opera_Performance:
                  // name = obj.properties.Original_Title+' // '+obj.properties.Date;
                  nodeColor = '#BE99FF';
                  clusterId = 4
                  break;
                case Place:
                  // name = obj.properties.City;
                  nodeColor = '#E2FFF4';
                  clusterId = 5
                  break;
                case Secondary_Source:
                  // name = 'Sec_Src: '+obj.properties.Secondary_Source+ ' pg. '+obj.properties.Page;
                  nodeColor = 'lightgreen';
                  clusterId = 6
                  break;
                case Troupe:
                  // name = 'Troupe: '+obj.properties.Troupe;
                  nodeColor = 'red';
                  clusterId = 7
                  break;
                default:
                  // name = "New Node";
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

  loadConnections(id) {
    let query = 'match (n)-[r]-(m) where id(n) = '+id+' return n,m,r limit 200';
    const exec = this.query(query)
    return exec
  },

  addEdge(edge, choice) {
    let source = edge.from;
    let destination = edge.to;
    let query = 'MATCH(n),(m) WHERE ID(n) = '+source+' AND ID(m) = '+destination+' MERGE (n)-[r:'+choice+']->(m) RETURN n,m'

    const exec = this.query(query)
    return exec
  },

  changeNode(result) {
    const format = this.formatNodes(result)
    return format
  },
  
  query(query) {
    let queryFinal
    if (query==undefined) {
      queryFinal = 'match(n)-[r]-(m) return n,m,r limit 50'
    } else {
      queryFinal = query
    }
    return this.get('neo4j.session')
    .run(queryFinal)
    .then((result) => {
      const format = this.formatNodes(result)
      return format
    })
  },

  delete(id, node) {
    let query = 'Match(n) where id(n) = '+id+' detach delete n'
    return this.get('neo4j.session')
    .run(query)
    .then(() =>{
      const remove = this.remove(node)
      return remove
    })
  },

  revealConnectedLabels(id, key) {
    let query = 'MATCH(n)-[r]-(m:'+key+') where id(n) = '+id+' return n,m,r limit 200'
    const exec = this.query(query)
    return exec
  }
});
