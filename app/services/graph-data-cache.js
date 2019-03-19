import Service, { inject as service } from '@ember/service'
import { set } from '@ember/object'
import md5 from 'md5'
import RSVP from 'rsvp';

export default Service.extend({
  neo4j: service('neo4j-connection'),
  graphCache: service('graph-data-cache'),
  router: service(),
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
    let array = this.items
    if (!array.isAny('id', item.id)) {
      this.items.pushObject(item)
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
      return this.neo4j.session
        .run(query)
        .then((result) => {
          return result.records.length < 1
        })
    } catch (err) {
      // not able to login properly
    }
  },

  getRandomColor () {
    var letters = 'BCDEF'.split('')
    var color = '#'
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)]
    }
    return color
  },

  getLabels () {
    let query = 'match(z)--(n) where z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" return labels(n)'
    let labels = []
    let mergedWithColour = [] // This should only be initiated empty if it doesn't exist in the localStorage

    if (localStorage.labelColours) {
      mergedWithColour = JSON.parse(localStorage.labelColours)
    }


    return this.neo4j.session
      .run(query)
      .then((result) => {
        let merged = []
        for (let i = 0; i < result.records.length; i++) {
          labels.push(result.records[i].toObject()['labels(n)'].toString().split(','))
        }
        merged = Array.from(new Set([].concat.apply([], labels)))
        merged = merged.filter(n => n)

        merged.forEach(element => {
          if (!mergedWithColour.find(function (obj) { return obj.label === element })) { // Checks if label and colour are already stored in localStorage. Only create colour if this function returns false
            // Both of these colours are too dark
            // let colour = `#${Math.random().toString(16).slice(-6)}`
            // let colour = `#${Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, 0)}`

            let colour = this.getRandomColor()
            mergedWithColour.push({
              label: element,
              colour: colour
            })
          }
        })
        this.set('labelTypes', merged)
        this.set('labelColours', mergedWithColour)
        localStorage.setItem('labelColours', JSON.stringify(mergedWithColour))
        return this.labelTypes
      })
  },

  getRelationships () {
    let query = 'match(z)--(n), (z)--(m), (n)-[r]-(m) where z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" return type(r)'
    let relationships = []
    return this.neo4j.session
      .run(query)
      .then((result) => {
        for (let i = 0; i < result.records.length; i++) {
          relationships.push(result.records[i].toObject()['type(r)'].toString())
        }
        relationships = relationships.shift['ORIGIN']
        let uniqueItems = Array.from(new Set(relationships))
        this.set('relationshipTypes', uniqueItems)
        return this.relationshipTypes
      })
  },

  getProperties (label) {
    let properties = []
    let query = 'match(z)--(n:' + label + ') where z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" return keys(n)'
    return this.neo4j.session
      .run(query)
      .then((result) => {
        for (let i = 0; i < result.records.length; i++) {
          for (let j = 0; j < result.records[i].toObject()['keys(n)'].length; j++) {
            properties.push(result.records[i].toObject()['keys(n)'][j])
          }
        }
        let uniqueItems = Array.from(new Set(properties))
        this.set('propertyTypes', uniqueItems)
        return this.propertyTypes
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

    // Assigning new properties or updating old properties
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

    console.log(query);

    const exec = this.query(query)
    const removeFloatingNodes = this.removeFloatingNodes()
    return (exec, removeFloatingNodes)
  },

  newNode (pos) {
    const graphCache = this.graphCache

    let query = 'Match (z) where z.user = "' + localStorage.user + '" and z.password="' + localStorage.password + '" create (n) MERGE(n)-[:ORIGIN]-(z) return n'
    return this.neo4j.session
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

    return this.neo4j.session
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
    return this.neo4j.session
      .run(query)
      .then(() => {
        const remove = this.remove(item)
        return remove
      })
  },

  formatNodes (result) {
    const graphCache = this.graphCache
    let labels

    function findName (obj) { // Decides what property to use as a display name if properties.name doesn't exist
      if (obj.properties.Date) {
        return obj.properties.Date
      } else if (obj.properties.Name) {
        return obj.properties.Name
      } else {
        if (Object.values(obj.properties)[0].toString() === '' || Object.values(obj.properties)[0].toString() === 'FALSE' || Object.values(obj.properties)[0].toString() === 'TRUE') { // Checks if the first property is a blank, in which case return the second property
          return Object.values(obj.properties)[1].toString()
        } else {
          return Object.values(obj.properties)[0].toString()
        }
      }
    }

    let promise = new Promise((resolve) => {
      labels = this.getLabels()
      resolve(labels)
    })

    promise.then((labels) => {
      this.set('labelTypes', labels)

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

            let name
            let nodeColor
            let isNode
            let color

            if (obj.labels) {
              isNode = true
              // nodeColor = JSON.parse(localStorage.labelColours).filter(l => {
              //   console.log(obj.labels); return l.label === obj.labels.firstObject }) // Returns the colour from the matching label from the list stored in localStorage
              name = findName(obj)
              labels = obj.labels
            } else {
              isNode = false
            }
            let newObj

            if (isNode) {
              color = JSON.parse(localStorage.labelColours).find(l => {
                return l.label === obj.labels.firstObject
              })
              if (!color) color = this.getRandomColor()
              else color = color.colour
              newObj = {
                name: name,
                id: 'n' + obj.identity.low,
                isNode: isNode,
                properties: obj.properties,
                color: color,
                isVisible: false,
                labels: obj.labels,
                relationshipCount: {},
                labelCount: {}
              }
            } else {
              newObj = {
                name: obj.type,
                id: 'r' + obj.identity.low,
                isNode: isNode,
                source: 'n' + obj.start.low,
                target: 'n' + obj.end.low
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
      return this.neo4j.session
        .run(queryFinal)
        .then((result) => {
          const format = this.formatNodes(result)
          return format
        })
    }
  },

  delete (id, node) {
    let query = 'Match(z)--(n) where id(n) = ' + id.substring(1) + ' and z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" detach delete n'
    return this.neo4j.session
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

  search(data) {
    let label = data.label
    let property = data.property
    let value = data.userInput
    this.router.transitionTo('visualization')
    let query = 'MATCH(z:Origin)--(n:' + label + '), (z)--(m), (n)-[r]-(m) where z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" and n.' + property + ' CONTAINS "' + value + '" return n,m,r limit 50'
    const exec = this.query(query)
    const removeFloatingNodes = this.removeFloatingNodes()
    return (exec, removeFloatingNodes)
  },

  removeFloatingNodes () {
    let query = 'Match(n:New_Node)--(z:Origin) where z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" detach delete n'
    return this.neo4j.session
      .run(query)
  }
})
