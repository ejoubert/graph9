import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';

export default Component.extend({
  graphCache: service('graph-data-cache'),
  router: service('router'),

  isHovering: false,
  color: computed('node', 'isHovering', function () {
    if (this.isHovering) {
      return this.node.color
    } else {
      return this.node.color
    }
  }),

  init() {
    this._super(...arguments)
    const graphCache = this.get('graphCache');
    this.set('types', graphCache.getLabels())
    this.set('choice', this.get('node.labels'))
    this.set('oldType', this.get('node.labels'))
  },

  actions: {

    selectNode(id) {
      this.get('router').transitionTo('visualization.edit-window', id)
    },

    queryForConnectingNodes(evt) {
      this.get('graphCache').loadConnections(evt)
    },

    focusNode() {
      this.set('isHovering', true)
    },

    blur() {
      this.set('isHovering', false)
    }
  }
});
