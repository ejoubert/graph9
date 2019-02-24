import Component from '@ember/component'

export default Component.extend({
  init () {
    this._super(...arguments)
    console.log(this.nodes)
    console.log(this.edges)
  }
})
