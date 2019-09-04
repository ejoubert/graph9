import Controller from '@ember/controller'
import { action } from '@ember/object'

export default class VisualizationController extends Controller {
  classNames = ['visualization']
  queryParams = ['labels', 'properties', 'searchTerms', 'loaded']
  loaded = []
  labels = []
  properties = []
  searchTerms = []

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
    this.set('labels', [])
    this.set('properties', [])
    this.set('searchTerms', [])
    this.set('loaded', [])
  }
}
