import Controller from '@ember/controller'
import { action } from '@ember/object'

export default class VisualizationController extends Controller {
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
