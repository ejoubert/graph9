import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | relationship-builder', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let service = this.owner.lookup('service:relationship-builder');
    assert.ok(service);
  });
});

