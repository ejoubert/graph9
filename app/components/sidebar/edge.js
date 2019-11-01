import Component from '@ember/component';
import { computed, action } from '@ember/object'

export default class SideBarEdge extends Component {
  @computed('selectedRelationshipType', 'sourceNode', 'destinationNode')
  get buttonIsDisabled() {
    return !this.sourceNode || !this.destinationNode || !this.selectedRelationshipType
  }

  @action
  createNewRelationship(newRelationship) {
    let formattedString = newRelationship.replace(/[^a-zA-Z]/g, '_')
    this.set('selectedRelationshipType', formattedString)
  }
}
