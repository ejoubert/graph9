import Controller from '@ember/controller'
import { action } from '@ember/object'
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default class VisualizationController extends Controller {
  @service('cache') dataCache
  @alias('dataCache.items')
  items

  classNames = ['visualization']
  queryParams = ['labels', 'properties', 'searchTerms', 'loaded', 'loadedIds']
  loaded = []
  labels = []
  properties = []
  searchTerms = []
  loadedIds = []

  @action
  showGuide() {
    this.set('showGuide', true)
  }

  @action
  closeModal() {
    this.set('showGuide', false)
  }

  @action
  clearCanvas() {
    this.queryParams.forEach(param => this.set(param, []))
    this.set('model', [])
  }

  @action
  undoLoad() {
    this.loaded.popObject()
  }
}
