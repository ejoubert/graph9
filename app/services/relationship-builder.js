import Service from '@ember/service'
import { inject as service } from '@ember/service'

export default class RelationshipBuilderService extends Service {
  @service('cache') dataCache

  isDrawingEdge = false
  sourceNode = null
  destinationNode = null

  setNode(node) {
    if (node !== this.sourceNode && node !== this.destinationNode) {
      if (!this.sourceNode) {
        this.set('sourceNode', node)
      } else {
        this.set('destinationNode', node)
      }
    }
    if (this.sourceNode && this.destinationNode) {
      this.set('isDrawingEdge', false)
    }
  }

  createRelationship(relationshipLabel) {
    if (this.sourceNode && this.destinationNode && relationshipLabel) {
      this.dataCache.createRelationship(this.sourceNode, this.destinationNode, label)
    }
  }

  resetNodes() {
    this.setProperties({
      sourceNode: null,
      destinationNode: null
    })
  }
}
