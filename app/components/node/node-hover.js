import Component from '@ember/component';
import { computed } from '@ember/object'

export default Component.extend({
  attributeBindings: ['style:style'],

  style: computed('node', function () {
    if (!this.node) return
    return `background-color: ${this.node.color}; border-radius: 15px;`
  })

});
