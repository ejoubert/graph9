import Component from '@ember/component';
import { computed } from '@ember/object'

export default class NodeHover extends Component {
  attributeBindings = ['style:style']

  @computed('node')
  get style() {
    if (!this.node) return
    return `background-color: ${this.node.color}; border-radius: 15px;`
  }
}
