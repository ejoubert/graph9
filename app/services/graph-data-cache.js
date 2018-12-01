import Service, { inject as service } from '@ember/service'
import { set } from '@ember/object'
import md5 from 'md5'

export default Service.extend({
  neo4j: service('neo4j-connection'),
  graphCache: service('graph-data-cache'),
  router: service('router'),
  items: null,
  isSelected: null,
  labelTypes: null,
  properTypes: null,
  relationshipsTypes: null,

  init () {
    this._super(...arguments)
    this.set('items', [])
    this.set('labelTypes', [])
  },

  add (item) {
    let array = this.get('items')
    if (!array.isAny('id', item.id)) {
      this.get('items').pushObject(item)
    }
  },

  // Providing an item will remove it from the cache of items
  remove (item) {
    this.items.removeObject(item)
  },

  // Clears the cache of items
  empty () {
    this.items.clear()
  },

  // Providing an id will return the entire object
  getItem (id) {
    return this.items.find(x => x.id === id)
  },

  login (loginDetails) {
    let query
    if (loginDetails) {
      query = 'Match (z) where z.user="' + loginDetails.user + '" and z.password="' + md5(loginDetails.password) + '" return z'
    } else {
      query = 'Match (z) where z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" return z'
    }
    try {
      return this.get('neo4j.session')
        .run(query)
        .then((result) => {
          return result.records.length < 1
        })
    } catch (err) {
    }
  },

  getLabels () {
    let query = 'match(z)--(n) where z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" return labels(n)'
    let labels = []
    return this.get('neo4j.session')
      .run(query)
      .then((result) => {
        let merged = []
        for (let i = 0; i < result.records.length; i++) {
          labels.push(result.records[i].toObject()['labels(n)'].toString().split(','))
        }
        merged = Array.from(new Set([].concat.apply([], labels)))
        merged = merged.filter(n => n)
        this.set('labelTypes', merged)
        return this.get('labelTypes')
      })
  },

  getRelationships () {
    let query = 'match(z)--(n), (z)--(m), (n)-[r]-(m) where z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" return type(r)'
    let relationships = []
    return this.get('neo4j.session')
      .run(query)
      .then((result) => {
        for (let i = 0; i < result.records.length; i++) {
          relationships.push(result.records[i].toObject()['type(r)'].toString())
        }
        relationships = relationships.shift['ORIGIN']
        let uniqueItems = Array.from(new Set(relationships))
        this.set('relationshipTypes', uniqueItems)
        return this.get('relationshipTypes')
      })
  },

  getProperties (label) {
    let properties = []
    let query = 'match(z)--(n:' + label + ') where z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" return keys(n)'
    return this.get('neo4j.session')
      .run(query)
      .then((result) => {
        for (let i = 0; i < result.records.length; i++) {
          for (let j = 0; j < result.records[i].toObject()['keys(n)'].length; j++) {
            properties.push(result.records[i].toObject()['keys(n)'][j])
          }
        }
        let uniqueItems = Array.from(new Set(properties))
        this.set('propertyTypes', uniqueItems)
        return this.get('propertyTypes')
      })
  },

  saveNode (propertiesToBeDeleted, labelsToBeDeleted, labelsToAdd, node, oldType, labelChoice, properties, newName) {
    let query
    let clauses = []
    let queryBase = 'MATCH(z)--(n) WHERE ID(n) = ' + node.id.substring(1) + ' and z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" '
    let queryEnd
    let addLabels
    let deleteLabels
    let deleteProperties

    // Assigning new properties or updating oold properties
    for (let key in properties) {
      clauses.push(' SET n.' + key + '="' + properties[key] + '" ')
    }
    // Joins properties together
    let updateProperties = clauses.join('')

    // Assigning a name value, either reassigning the old name, or the new name
    if (newName) {
      queryEnd = ' SET n.Name ="' + newName + '" RETURN n'
    } else if (node.name) {
      queryEnd = ' SET n.Name ="' + node.name + '" RETURN n'
    }

    // Checks to see if there are labels to add
    if (!Array.isArray(labelsToAdd) || !labelsToAdd.length) {
      addLabels = ''
    } else {
      addLabels = ' SET n:' + labelsToAdd.join(' SET n:')
    }

    // Checks to see if there are labels to be removed
    if (!Array.isArray(labelsToBeDeleted) || !labelsToBeDeleted.length) {
      deleteLabels = ''
    } else {
      deleteLabels = ' REMOVE n:' + labelsToBeDeleted.join(' REMOVE n:')
    }

    // Checks to see if there are properties to be deleted
    if (!Array.isArray(propertiesToBeDeleted) || !propertiesToBeDeleted.length) {
      deleteProperties = ''
    } else {
      deleteProperties = 'SET n.' + propertiesToBeDeleted.join(' = null SET n.') + ' = null '
    }

    // Assemble query
    query = queryBase + updateProperties + deleteProperties + addLabels + deleteLabels + queryEnd

    const exec = this.query(query)
    const removeFloatingNodes = this.removeFloatingNodes()
    return (exec, removeFloatingNodes)
  },

  newNode (pos) {
    const graphCache = this.get('graphCache')

    let query = 'Match (z) where z.user = "' + localStorage.user + '" and z.password="' + localStorage.password + '" create (n) MERGE(n)-[:ORIGIN]-(z) return n'
    return this.get('neo4j.session')
      .run(query)
      .then((result) => {
        for (let i = 0; i < result.records.length; i++) {
          let keys = Object.keys(result.records[i].toObject())
          for (let j = 0; j < keys.length; j++) {
            let obj = result.records[i].toObject()[keys[j]]
            let newObj
            newObj = {
              name: 'New Node',
              id: 'n' + obj.identity.low,
              isNode: true,
              properties: obj.properties,
              color: '#3893e8',
              labels: obj.labels,
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

  labelCount (id, node) {
    let query = 'Match(z)--(n), (z)--(m), (n)-[r]-(m) where id(n) = ' + id.substring(1) + ' and z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" and not n:Origin and not m:Origin return keys(m), m,r'
    let labelMap = {}
    let relationshipMap = {}
    let propertyMap = {}

    return this.get('neo4j.session')
      .run(query)
      .then((result) => {
        for (var i = 0; i < result.records.length; i++) {
          // Counts the number of relationships and labels connected to a node
          let m = result.records[i].toObject().m
          let r = [result.records[i].toObject().r.type]
          let mProperties = result.records[i].toObject().m.properties

          for (let l = 0; l < Object.keys(mProperties).length; l++) {
            // Object.keys(mProperties)[l] not sure what purpose this has...
            if (Object.keys(mProperties)[l] !== 'Date' && Object.values(mProperties)[l] !== '' && Object.keys(mProperties)[l] !== 'Latitude' && Object.keys(mProperties)[l] !== 'Longitude' && Object.keys(mProperties)[l] !== 'Page') {
              if (propertyMap[Object.values(mProperties)[l]] === undefined) {
                propertyMap[Object.values(mProperties)[l]] = 0
              }
              propertyMap[Object.values(mProperties)[l]]++
            }
          }

          // Labels
          for (let j = 0; j < m.labels.length; j++) {
            if (labelMap[m.labels[j]] === undefined) {
              labelMap[m.labels[j]] = 0
            }
            labelMap[m.labels[j]]++
          }

          // Relationships
          for (let k = 0; k < r.length; k++) {
            if (relationshipMap[r[k]] === undefined) {
              relationshipMap[r[k]] = 0
            }
            relationshipMap[r[k]]++
          }
        }
      })
      .then(() => {
        set(node, 'labelCount', labelMap)
        set(node, 'relationshipCount', relationshipMap)
        set(node, 'propertiesCount', propertyMap)
      })
  },

  deleteEdge (id) {
    let item = this.getItem(id)
    let id1 = id.substr(1)
    let query = 'MATCH (m)-[r]-(n) WHERE id(r)=' + id1 + ' DELETE r return n,m'
    return this.get('neo4j.session')
      .run(query)
      .then((result) => {
        const remove = this.get('remove')(item)
        return remove
      })
  },

  formatNodes (result) {
    const graphCache = this.get('graphCache')
    let labels

    function findName (obj) {
      if (obj.properties.Name) {
        return obj.properties.Name
      } else {
        return Object.values(obj.properties)[0].toString();    
      }
    }

    let promise = new Promise((resolve, reject) => {
      labels = this.getLabels()
      resolve(labels)
      reject(reason)
    })

    promise.then((labels) => {
      this.set('labelTypes', labels)
      let Aesthetician = labels[labels.indexOf('Aesthetician')]
      let Review = labels[labels.indexOf('Review')]
      let Performer = labels[labels.indexOf('Performer')]
      let Impresario = labels[labels.indexOf('Impresario')]
      let Theatre_Director = labels[labels.indexOf('Theatre_Director')]
      let Critic = labels[labels.indexOf('Critic')]
      let Librettist = labels[labels.indexOf('Librettist')]
      let Saint = labels[labels.indexOf('Saint')]
      let Opera_Performance = labels[labels.indexOf('Opera_Performance')]
      let Ideal_Opera = labels[labels.indexOf('Ideal_Opera')]
      let Person = labels[labels.indexOf('Person')]
      let Composer = labels[labels.indexOf('Composer')]
      let Troupe = labels[labels.indexOf('Troupe')]
      let Place = labels[labels.indexOf('Place')]
      let Secondary_Source = labels[labels.indexOf('Secondary_Source')]
      let Journal = labels[labels.indexOf('Journal')]

      // const partitionArray = (array, size) => array.map( (e,i) => (i % size === 0) ? array.slice(i, i + size) : null ) .filter( (e) => e )
      let array = result.records

      for (let i = 0; i < array.length; i++) {
        // Assigns different names and colours depending on the type of label
        let keys = Object.keys(array[i].toObject())

        for (let j = 0; j < keys.length; j++) {
          if (/keys\(/.exec(keys[j])) {
            // this key is a key key; we can ignore it.
          } else {
            // this key is actually an object being returned from neo4j
            let obj = array[i].toObject()[keys[j]]

            // figure out what our "name" property will be, based on the node label
            // TODO: I'm just looking at the first in the list of labels, but I should check all the labels for a node.
            // But this code is only going to last until the database has been refactored to include a 'name' property.
            let name
            let nodeColor
            let isNode
            let clusterId

            if (obj.labels) {
              isNode = true
              switch (obj.labels[0]) {
                case Person:
                  name = obj.properties.Name
                  nodeColor = '#DE6A5E'
                  clusterId = 1
                  break
                case Ideal_Opera:
                  name = obj.properties.Title
                  nodeColor = '#FF9BC6'
                  clusterId = 2
                  break
                case Journal:
                  name = obj.properties.Title
                  nodeColor = '#FFE5E5'
                  clusterId = 3
                  break
                case Opera_Performance:
                  name = obj.properties.Title + ' // ' + obj.properties.Date
                  nodeColor = '#BE99FF'
                  clusterId = 4
                  break
                case Place:
                  // let name = Object.values(obj.properties).filter(n=>n)
                  name = obj.properties.Name
                  nodeColor = '#E2FFF4'
                  break
                case Secondary_Source:
                  name = 'Sec_Src: ' + obj.properties.Title + ' pg. ' + obj.properties.Page
                  nodeColor = '#3B6E6C'
                  clusterId = 6
                  break
                case Troupe:
                  name = 'Troupe: ' + obj.properties.Name
                  nodeColor = '#61AD8A'
                  clusterId = 7
                  break
                case Review:
                  name = obj.properties.Review
                  nodeColor = '#bada55'
                  clusterId = 8
                  break
                case Aesthetician:
                  name = obj.properties.Name
                  nodeColor = '#F76A39'
                  clusterId = 9
                  break
                case Composer:
                  name = obj.properties.Name
                  nodeColor = '#DE6A5E'
                  clusterId = 10
                  break
                case Critic:
                  name = obj.properties.Name
                  nodeColor = '#2C6C36'
                  clusterId = 11
                  break
                case Impresario:
                  name = obj.properties.Name
                  nodeColor = '#A25848'
                  clusterId = 12
                  break
                case Librettist:
                  name = obj.properties.Name
                  nodeColor = '#DE9843'
                  clusterId = 13
                  break
                case Performer:
                  name = obj.properties.Name
                  nodeColor = '#F4AA50'
                  clusterId = 14
                  break
                case Saint:
                  name = obj.properties.Name
                  nodeColor = '#07D1A5'
                  clusterId = 15
                  break
                default:
                  name = findName(obj)
                  nodeColor = '#3893e8'
                  clusterId = 0
                  labels = obj.labels
              }
            } else {
              isNode = false
            }
            let newObj

            if (isNode) {
              newObj = {
                name: name,
                id: 'n' + obj.identity.low,
                isNode: isNode,
                properties: obj.properties,
                color: nodeColor,
                isVisible: false,
                labels: obj.labels,
                cId: clusterId,
                relationshipCount: {},
                labelCount: {}
              }
            } else {
              newObj = {
                name: obj.type,
                id: 'r' + obj.identity.low,
                isNode: isNode,
                start: 'n' + obj.start.low,
                end: 'n' + obj.end.low
              }
            }
            graphCache.add(newObj)
          }
        }
      }
    })
  },

  loadConnections (id) {
    let query = 'match (z)--(n), (z)--(m), (n)-[r]-(m) where id(n) = ' + id.substring(1) + ' and z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" and not n:Origin and not m:Origin return n,m,r'
    const exec = this.query(query)
    return exec
  },

  addEdge (edge, choice) {
    let source = edge.from
    let destination = edge.to
    let query = 'MATCH(z)--(n),(m) WHERE ID(n) = ' + source.substring(1) + ' AND ID(m) = ' + destination.substring(1) + ' and z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" and not n:Origin and not m:Origin MERGE (n)-[r:' + choice + ']->(m) RETURN n,m'

    const exec = this.query(query)
    return exec
  },

  changeNode (result) {
    const format = this.formatNodes(result)
    return format
  },

  query (query) {
    let queryFinal
    if (query === undefined) {
      queryFinal = ''
    } else {
      queryFinal = query
      return this.get('neo4j.session')
        .run(queryFinal)
        .then((result) => {
          const format = this.formatNodes(result)
          return format
        })
    }
  },

  delete (id, node) {
    let query = 'Match(z)--(n) where id(n) = ' + id.substring(1) + ' and z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" detach delete n'
    return this.get('neo4j.session')
      .run(query)
      .then(() => {
        const remove = this.remove(node)
        return remove
      })
  },

  revealConnectedLabels (id, key) {
    let query = 'match(z)--(n), (z)--(m), (n)-[r]-(m:' + key + ') where id(n) = ' + id.substring(1) + ' and z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" and not n:Origin and not m:Origin return n,m,r limit 50'
    const exec = this.query(query)
    return exec
  },

  nameChange (id, name) {
    let query = 'MATCH(z)--(n) where id(n) = ' + id.substring(1) + ' set n.Name="' + name + '" return n'
    const exec = this.query(query)
    return exec
  },

  search (value, label, property) {
    this.get('router').transitionTo('visualization')
    let query = 'MATCH(n:' + label + ')--(z:Origin) where z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" and n.' + property + ' CONTAINS "' + value + '" return n limit 50'
    const exec = this.query(query)
    const removeFloatingNodes = this.removeFloatingNodes()
    return (exec, removeFloatingNodes)
  },

  removeFloatingNodes () {
    let query = 'Match(n:New_Node)--(z:Origin) where z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" detach delete n'
    return this.get('neo4j.session')
      .run(query)
  }
})
