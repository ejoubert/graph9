import Component from '@ember/component';
import { inject as service } from '@ember/service'

export default class RelationshipList extends Component {
  @service('cache') dataCache

  didInsertElement() {
    this.set('allRelationships', this.dataCache.getRelationships())
  }
}
