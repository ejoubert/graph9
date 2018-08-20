import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import { set } from '@ember/object';

export default Route.extend({
  graphCache: service('graph-data-cache'),


  model(node_id) {
    const graphCache = this.get('graphCache')
    let id = node_id.edit_id
    
    for (var i = 0; i < this.get('graphCache.items').length; i++) {

      let graphNode = this.get('graphCache.items')[i]

      if (graphNode.id == id) {

        graphCache.labelCount(id, graphNode)

        return graphNode
      }
    }
  }
})



