import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | visualization/canvas-surface', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{visualization/canvas-surface}}`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      {{#visualization/canvas-surface}}
        template block text
      {{/visualization/canvas-surface}}
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
