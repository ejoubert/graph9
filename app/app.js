import Application from '@ember/application'
import Resolver from './resolver'
import loadInitializers from 'ember-load-initializers'
import config from './config/environment'
import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations';

const App = Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver

})

Sentry.init({
  dsn: 'https://b2b59f389b144d9ebb4f865d0d4563a5@sentry.io/1485605',
  integrations: [new Integrations.Ember()]
});

loadInitializers(App, config.modulePrefix)

export default App
