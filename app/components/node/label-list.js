import Component from '@ember/component';
import { inject as service } from '@ember/service'

export default class NodeLabel extends Component {
  @service('cache') dataCache

  didInsertElement() {
    this.set('allLabels', this.dataCache.getLabels())
  }
}
