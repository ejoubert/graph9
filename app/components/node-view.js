import Component from '@ember/component'
import { inject as service } from '@ember/service'
import { computed } from '@ember/object'

export default Component.extend({
  graphCache: service('graph-data-cache'),
  router: service(),

  isHovering: false,
  color: computed('node', 'isHovering', function () {
    return this.node.color
  }),

  init () {
    this._super(...arguments)
    const graphCache = this.graphCache
    this.set('types', graphCache.getLabels())
    this.set('choice', this.node.labels)
    this.set('oldType', this.node.labels)
  },

  actions: {

    selectNode (id) {
      this.router.transitionTo('visualization.edit-window', id)
    },

    queryForConnectingNodes (evt) {
      this.graphCache.loadConnections(evt)
    },

    focusNode () {
      this.set('isHovering', true)
    },

    blur () {
      this.set('isHovering', false)
    }
  }
})
