import Component from '@ember/component'
import { inject as service } from '@ember/service'
import { computed } from '@ember/object'
import { htmlSafe } from '@ember/template'

export default Component.extend({
  dataCache: service('dataCache'),
  router: service(),

  isHovering: false,

  color: computed('node', 'isHovering', function () {
    return this.node.color
  }),

  badgeColor: computed('node', 'isHovering', function () {
    return htmlSafe('background-color: ' + this.node.color)
  }),

  init () {
    this._super(...arguments)
    const dataCache = this.dataCache
    this.set('types', dataCache.getLabels())
    this.set('choice', this.node.labels)
    this.set('oldType', this.node.labels)
  },

  actions: {

    selectNode (id) {
      this.router.transitionTo('visualization.edit-window', id)
    },

    queryForConnectingNodes (evt) {
      this.dataCache.loadConnections(evt)
    },

    focusNode () {
      this.set('isHovering', true)
    },

    blur () {
      this.set('isHovering', false)
    }
  }
})
