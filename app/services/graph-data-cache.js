import Service from '@ember/service';
import {inject as service} from '@ember/service';

export default Service.extend({
  neo4j: service('neo4j-connection'),
  graphCache: service('graph-data-cache'),
  query: null,
  items: null,

  init() {
    this._super(...arguments)
    this.set('items', []);
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
  query(newQuery) {
    let newNode = {
      name: "James",
      id: 999,
      isNode: true
    }
    const graphCache = this.get('graphCache')
    return this.get('neo4j.session')
    .run(newQuery)
    .then((result) => {
      let nodes = []
      let performance = []

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
      // console.log(nodes);
      return [];
    })
  }
});
