import Component from '@ember/component';
import {inject as service} from '@ember/service'

export default Component.extend({
  neo4j: service('neo4j-connection'),
  graphCache: service('graph-data-cache'),

  actions: {

    addTestNode() {
      const graphCache = this.get('graphCache');
      let newNode = {
        name: "James",
        isNode: true,
        id: 999
      }
      let query = 'match(n:Opera_Performance)-[r]-(m:Place) return n,m,r limit 10'
      return this.get('neo4j.session')
      .run(query)
      .then((result) => {
        graphCache.add(newNode)
        for (let i = 0; i < result.records.length; i++) {
          // what is this thing?
          let keys = Object.keys(result.records[i].toObject())
          for (let j = 0; j < keys.length; j++) {
            if (/keys\(/.exec(keys[j])) {
              // this key is a key key; we can ignore it.
            } else {
              // this key is actually an object being returned from neo4j
              let obj = result.records[i].toObject()[keys[j]]
              // console.log(obj)

              // figure out what our "name" property will be, based on the node label
              // TODO: I'm just looking at the first in the list of labels, but I should check all the labels for a node.
              // But this code is only going to last until the database has been refactored to include a 'name' property.
              let name = '<invalid>';
              let isNode;
              if (obj.labels) {
                isNode = true;
                switch(obj.labels[0]) {
                  case "Person":
                    name = 'Composer: '+obj.properties.Composer;
                    break;
                  case "Ideal_Opera":
                    name = 'Ideal: '+obj.properties.Ideal_Opera;
                    break;
                  case "Journal":
                    name = 'Journal: '+obj.properties.Journal
                    break;
                  case "Opera_Performance":
                    name = 'Perf: '+obj.properties.Original_Title
                    break;
                  case "Place":
                    name = 'City: '+obj.properties.City
                    break;
                  case "Secondary_Source":
                    name = 'Sec_Src: '+obj.properties.Secondary_Source
                    break;
                  case "Troupe":
                    name = 'Troupe: '+obj.properties.Troupe
                    break;
                  default:
                    name = "<not implemented>"
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
                  labels: obj.labels
                }
              } else {
              // now I have the object that neo4j returned, whatever it's been called.
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
      console.log(this.get('graphCache.items'))
      return [];
      })
    }
  }
});
