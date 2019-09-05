import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'

export default Route.extend({
  dataCache: service('cache'),

  model (nodeId) {
    const dataCache = this.dataCache
    let id = nodeId.edit_id

    for (var i = 0; i < this.dataCache.items.length; i++) {
      let graphNode = this.dataCache.items[i]
      if (graphNode.id === id) {
        dataCache.labelCount(id, graphNode)
        return graphNode
      }
    }
  }
})
