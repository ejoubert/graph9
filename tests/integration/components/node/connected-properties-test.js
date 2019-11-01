import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | node/connected-properties', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{node/connected-properties}}`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      {{#node/connected-properties}}
        template block text
      {{/node/connected-properties}}
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
