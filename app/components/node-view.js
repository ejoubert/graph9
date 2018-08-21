/*
Holds the actions given to individual nodes in the visjs network. The nodes can be selected to show their details; double-clicked to show their
connections; and have mouse-over/mouse-leave actions to reveal/hide their data in the status bar, and increase/decrease their size.
*/

import Component from '@ember/component';
import {inject as service} from '@ember/service';
import { set } from '@ember/object';

export default Component.extend({
  graphCache: service('graph-data-cache'),
  router: service('router'),

  isHovering: false,

  init() {
    this._super(...arguments)
    const graphCache = this.get('graphCache');
    this.set('types', graphCache.getLabels())
    this.set('choice', this.get('node.labels'))
    this.set('oldType', this.get('node.labels'))
  },

  actions: {

    //On select, transitions to node's route with editing window
    selectNode(id) {
      this.get('router').transitionTo('visualization.edit-window', id)
    },

    //On double-click, queries for the node's connection and loads them into the model
    double(e) {
      const graphCache = this.get('graphCache');
      graphCache.loadConnections(e)
    },

    //On mouse-over, reveals the node's information in the canvas' status bar, and increases the node's size
    focusNode(nodeId) {
      this.set('isHovering', true)
      this.parentView.nodes.update({id: nodeId, value: 15});
    },

    //On mouse-leave, hides the status bar, returns the node's size to normal
    blur(nodeId) {
      this.set('isHovering', false)
      this.parentView.nodes.update({id: nodeId, value: 10});

    }
  }
});
