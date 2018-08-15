import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('composers');
  this.route('composer', {path: '/composers/:composer_id', function() {
  }}, function() {
    this.route('operas', {path: '/operas/:opera_id'});
  });
  this.route('visualization', function() {
    this.route('node-edit', {path: '/node-edit/:node_id'});
  });
});

export default Router;