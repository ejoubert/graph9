import Component from '@ember/component';
import { computed } from '@ember/object'

export default class SideBarEdge extends Component {
  @computed('selectedRelationshipType', 'sourceNode', 'destinationNode')
  get buttonIsDisabled() {
    return !this.sourceNode || !this.destinationNode || !this.selectedRelationshipType
  }
}
