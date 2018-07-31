import Service from '@ember/service';
import {inject as service} from '@ember/service';

export default Service.extend({
  neo4j: service('neo4j-connection'),
  graphCache: service('graph-data-cache'),
  items: null,
  isSelected: null,

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
    console.log('loading data with: "'+newQuery+'"')
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
            let nodeColor;
            let isNode;
            let clusterId;
            if (obj.labels) {
              isNode = true;
              switch(obj.labels[0]) {
                case "Person":
                  name = 'Composer: '+obj.properties.Composer;
                  nodeColor = '#A199FF';
                  clusterId = 1
                  break;
                case "Ideal_Opera":
                  name = obj.properties.Ideal_Opera;
                  nodeColor = '#FF9BC6';
                  clusterId = 2
                  break;
                case "Journal":
                  name = obj.properties.Journal+' pg. '+ obj.properties.Page;
                  nodeColor = '#FFE5E5';
                  clusterId = 3
                  break;
                case "Opera_Performance":
                  name = obj.properties.Original_Title+' // '+obj.properties.Date;
                  nodeColor = '#BE99FF';
                  clusterId = 4
                  break;
                case "Place":
                  name = obj.properties.City;
                  nodeColor = '#E2FFF4';
                  clusterId = 5
                  break;
                case "Secondary_Source":
                  name = 'Sec_Src: '+obj.properties.Secondary_Source;
                  nodeColor = 'lightgreen';
                  clusterId = 6
                  break;
                case "Troupe":
                  name = 'Troupe: '+obj.properties.Troupe;
                  nodeColor = 'red';
                  clusterId = 7
                  break;
                default:
                  name = "<not implemented>";
                  nodeColor = 'lightblue'
                  clusterId = 0
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
                cId: clusterId
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
            // console.log(newObj)
          }
        }
      }
      // console.log(graphCache)
      return [];
    })
  }
});
