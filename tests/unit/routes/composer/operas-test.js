import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | composer/operas', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:composer/operas');
    assert.ok(route);
  });
});
