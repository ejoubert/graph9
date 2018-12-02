import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'

export default Route.extend({
  graphCache: service('graph-data-cache'),

  model (nodeId) {
    const graphCache = this.graphCache
    let id = nodeId.edit_id

    for (var i = 0; i < this.graphCache.items.length; i++) {
      let graphNode = this.graphCache.items[i]
      if (graphNode.id === id) {
        graphCache.labelCount(id, graphNode)
        return graphNode
      }
    }
  }
})
