import Service, { inject as service } from '@ember/service'
import { set } from '@ember/object'
import md5 from 'md5'

export default class dataCache extends Service {
  @service router
  @service('neo4j-connection') neo4j

  items = null
  isSelected = null
  labelTypes = null
  properTypes = null
  relationshipsTypes = null

  blankNodeColor = '#3893E8'

  init() {
    super.init(...arguments)
    this.set('items', [])
    this.set('labelTypes', [])
  }

  add(item) {
    let array = this.items
    if (!array.isAny('id', item.id)) {
      this.items.pushObject(item)
    }
  }

  // Providing an item will remove it from the cache of items
  remove(item) {
    this.items.removeObject(item)
  }

  // Clears the cache of items
  empty() {
    this.items.clear()
  }

  // Providing an id will return the entire object
  getItem(id) {
    return this.items.find(x => x.id === id)
  }

  login(loginDetails) {
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
  }

  getRandomColor() {
    var letters = 'BCDEF'.split('')
    var color = '#'
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)]
    }
    return color
  }

  getNodeColor(label) {
    if (!localStorage.labelColors) {
      localStorage.setItem('labelColors', JSON.stringify([]))
    }

    if (!label) {
      // this is only for newly created nodes which don't have any labels
      return this.blankNodeColor
    }

    let localStorageArray = localStorage.labelColors ? JSON.parse(localStorage.labelColors) : []
    let foundColor = localStorageArray.find(l => label === l.label)

    if (foundColor) {
      return foundColor.color
    }

    foundColor = this.getRandomColor()
    this.saveColorToLocalStorage(foundColor, label)
    return foundColor
  }

  saveColorToLocalStorage(color, label) {
    let colorObj = {
      color, label
    }
    let newArr = JSON.parse(localStorage.labelColors)
    newArr.push(colorObj)
    localStorage.setItem('labelColors', JSON.stringify(newArr))
  }

  getLabels() {
    let query = 'match(z)--(n) where z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" return labels(n)'
    let labels = []

    return this.neo4j.session
      .run(query)
      .then((result) => {
        result.records.forEach(label => labels.push(label.toObject()['labels(n)'].toString().split(',')))
        labels = labels.flat().uniq().filter(n => n)
        labels.map(label => {
          return {
            label,
            color: this.getNodeColor(label)
          }
        })

        this.set('labelTypes', labels)
        return this.labelTypes
      })
  }

  getRelationships() {
    let query = `MATCH(z)--(n), (z)--(m), (n)-[r]-(m) WHERE z.user="${localStorage.user}" AND z.password="${localStorage.password}" RETURN type(r)`
    return this.neo4j.session
      .run(query)
      .then((result) => {
        let relationships = result.records.map(r => r.toObject()['type(r)'].toString()).uniq()
        return relationships
      })
  }

  getProperties(label) {
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
  }

  async loadModel(params) {
    let globalSearch = params.labels.length === 0 && params.properties.length === 0 && params.searchTerms.length === 0

    let loadedIds = params.loadedIds
    let loadedIdsPromise = new Promise((resolve) => {
      let data = this.loadNodeId(loadedIds)
      resolve(data)
    })

    if (globalSearch) {
      return loadedIdsPromise
    }

    let loaded = params.loaded

    let promise = new Promise((resolve) => {
      let data = this.loadConnections(loaded)
      resolve(data)
    })


    let loadedModel, loadedIdsModel

    loadedIdsPromise.then(data => {
      loadedIdsModel = data
    })

    return promise.then(data => {
      loadedModel = data

      let labels = params.labels
      let properties = params.properties
      let searchTerms = params.searchTerms

      let labelString = `n:${labels.join(' OR n:')}`
      let searchTermsString = ''

      for (let i = 0; i < properties.length; i++) {
        let property = properties[i]

        for (let y = 0; y < searchTerms.length; y++) {
          let searchTerm = searchTerms[y]
          searchTermsString += ` n.${property} CONTAINS "${searchTerm}" OR`
        }
      }
      searchTermsString = searchTermsString.slice(1, -3)

      // this isn't being restricted by user properly.
      let query = `MATCH(z:Origin)--(n), (z)--(m), (n)-[r]-(m) where z.user="${localStorage.user}" and z.password="${localStorage.password}" and (${labelString}) and ${searchTermsString} return n limit 200`

      return this.neo4j.session.run(query)
        .then(result => {
          let modelNodes = this.formatNodes(result)
          return [...modelNodes, ...loadedModel, ...loadedIdsModel].uniqBy('id')
        })
    })
  }

  saveNode(node, changes, originalNode) {
    let query = `MATCH(z)--(n) WHERE ID(n) = ${node.id.substring(1)} and z.user="${localStorage.user}" and z.password="${localStorage.password}" `

    let propertiesKeysToChange = changes.properties.keys
    let propertiesValuesToChange = changes.properties.values

    // rename property values
    for (let key in propertiesValuesToChange) {
      let propertyValue = propertiesValuesToChange[key][1]
      if (key && key !== '') {
        query += `SET n.${key} = "${propertyValue}" `
      }
    }

    // rename property keys
    for (let key in propertiesKeysToChange) {
      if (key && key !== '') {
        let propertyChangeList = propertiesKeysToChange[key]
        let oldName = propertyChangeList[0]
        let newName = propertyChangeList[1]
        query += `SET n.${newName} = n.${oldName} REMOVE n.${oldName} `
      }
    }

    // remove labels
    let removedLabels = originalNode.labels.filter(x => !node.labels.includes(x));
    removedLabels.forEach(label => query += `REMOVE n:${label} `)

    // add labels
    let addedLabels = node.labels.filter(x => !originalNode.labels.includes(x));
    addedLabels.forEach(label => query += `SET n:${label} `)

    query += `return n`

    console.log(query)

    const exec = this.query(query)
    return exec
    // const removeFloatingNodes = this.removeFloatingNodes()
    // return (exec, removeFloatingNodes)
  }

  createNode() {
    let query = `Match (z) where z.user = "${localStorage.user}" and z.password="${localStorage.password}" create (n) MERGE(n)-[:ORIGIN]-(z) return n`
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
              color: this.blankNodeColor,
              labels: obj.labels,
              isVisible: false,
              clusterId: 0,
            }
            return newObj
          }
        }
      })
  }

  labelCount(id, node) {
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
  }

  deleteEdge(id) {
    let item = this.getItem(id)
    let id1 = id.substr(1)
    let query = 'MATCH (m)-[r]-(n) WHERE id(r)=' + id1 + ' DELETE r return n,m'
    return this.neo4j.session
      .run(query)
      .then(() => {
        const remove = this.remove(item)
        return remove
      })
  }

  getNodeName(obj) { // Decides what property to use as a display name if properties.name doesn't exist
    if (obj.properties.Name) {
      return obj.properties.Name
    } else {
      if (obj.labels.includes('Opera_Performance')) {
        let date = obj.properties.Date.substring(0, 4)
        let place = obj.properties.Place
        if (!place) {
          place = ''
        }
        return date + ' ' + place + ' Performance'
      } else if (obj.labels.includes("Review")) {
        return obj.properties.Year + ' Review'
      } else if (obj.labels.includes("Ideal_Opera")) {
        return obj.properties.Title
      } else if (obj.labels.includes("Place")) {
        if (obj.properties.Place)
          return obj.properties.Place
        else if (obj.properties.City) {
          return obj.properties.City
        }
        else if (obj.properties.Theater) {
          return obj.properties.Theater
        }
        else if (obj.properties.Court) {
          return obj.properties.Court
        }
        else if (obj.properties.Country) {
          return obj.properties.Country
        }
      } else if (obj.labels[0] === "Journal") {
        return obj.properties.Title
      } else if (obj.labels[0] === 'Secondary_Source') {
        return obj.properties.Title
      } else if (Object.entries(obj.properties)[0]) {
        return Object.values(obj.properties)[0];
      } else {
        return 'New Node'
      }
    }
  }

  formatNodes(result) {
    let labels = this.getLabels(), nodes = [], records = result.records

    for (let i = 0; i < records.length; i++) {
      // Assigns different names and colours depending on the type of label
      let keys = Object.keys(records[i].toObject())

      for (let j = 0; j < keys.length; j++) {
        if (/keys\(/.exec(keys[j])) {
          // this key is a key key; we can ignore it.
        } else {
          // this key is actually an object being returned from neo4j
          let obj = records[i].toObject()[keys[j]]
          let name, color, newObj, isNode = false

          if (obj.labels) {
            isNode = true
            name = this.getNodeName(obj)
            labels = obj.labels
          }

          if (isNode) {
            color = this.getNodeColor(labels[0])

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
          let foundNode = this.items.find(n => n.id === newObj.id)
          if (foundNode) {
            this.items.removeObject(foundNode)
          }
          nodes.push(newObj)
          this.items.push(newObj)
        }
      }
    }
    return nodes
  }

  loadConnections(id) {
    let query = `match (z)--(n), (z)--(m), (n)-[r]-(m) where z.user="${localStorage.user}" and z.password="${localStorage.password}" and not n:Origin and not m:Origin and id(n)`

    if (Array.isArray(id)) {
      let ids = id.map(i => i.substring(1)).uniq()
      query = query + ` IN [${ids}] `
    } else {
      id = id.substring(1)
      query = query + ` = ${id} `
    }
    query = query + `return n,r,m`

    return this.query(query)
  }

  loadNodeId(ids) {
    let idString = ids.map(i => i.substring(1)).uniq()
    let query = `MATCH(z)--(n) where z.user="${localStorage.user}" and z.password="${localStorage.password}" and not n:Origin and id(n) IN [${idString}] RETURN n`
    return this.query(query)
  }

  createRelationship({ source, destination, relLabel }) {
    let query = `MATCH(z)--(n),(m) WHERE ID(n) = ${source.substring(1)} AND ID(m) = ${destination.substring(1)} AND z.user="${localStorage.user}" AND z.password="${localStorage.password}" AND NOT n:Origin AND NOT m:Origin MERGE (n)-[r:${relLabel}]->(m) RETURN r`
    return this.query(query)
  }

  changeNode(result) {
    const format = this.formatNodes(result)
    return format
  }

  query(query) {
    return this.neo4j.session
      .run(query)
      .then((result) => {
        const format = this.formatNodes(result)
        return format
      })
  }

  deleteNode(node) {
    this.remove(node)
    let query = `Match(z)--(n) WHERE id(n) = ${node.id.substring(1)} AND z.user="${localStorage.user}" AND z.password="${localStorage.password}" DETACH DELETE n`
    return this.neo4j.session
      .run(query).then(() => {
      })
  }

  revealConnectedLabels(id, key) {
    let query = 'match(z)--(n), (z)--(m), (n)-[r]-(m:' + key + ') where id(n) = ' + id.substring(1) + ' and z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" and not n:Origin and not m:Origin return n,m,r limit 50'
    const exec = this.query(query)
    return exec
  }

  nameChange(id, name) {
    let query = 'MATCH(z)--(n) where id(n) = ' + id.substring(1) + ' set n.Name="' + name + '" return n'
    const exec = this.query(query)
    return exec
  }

  search(data) {
    let label = data.label
    let property = data.property
    let value = data.userInput
    let query = 'MATCH(z:Origin)--(n:' + label + '), (z)--(m), (n)-[r]-(m) where z.user="' + localStorage.user + '" and z.password="' + localStorage.password + '" and n.' + property + ' CONTAINS "' + value + '" return n,m,r limit 50'
    const exec = this.query(query)
    const removeFloatingNodes = this.removeFloatingNodes()
    return (exec, removeFloatingNodes)
  }

  removeFloatingNodes() {
    let query = `MATCH(z:Origin)--(n) WHERE size(labels(n)) = 0 DETACH DELETE n`
    return this.neo4j.session
      .run(query)
  }
}
