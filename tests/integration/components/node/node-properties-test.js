import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | node/node-properties', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{node/node-properties}}`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      {{#node/node-properties}}
        template block text
      {{/node/node-properties}}
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
