import Component from '@ember/component'

export default class NodeCanvas extends Component{
  init () {
    this._super(...arguments)
    console.log(this.nodes)
    console.log(this.edges)
  }
}
