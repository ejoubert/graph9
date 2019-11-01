/* eslint-env node */
'use strict'

module.exports = function (deployTarget) {
  let ENV = {
    build: {}
    // include other plugin configuration that applies to all deploy targets here
  }

  ENV.pipeline = {
    activateOnDeploy: true
  }

  ENV['s3'] = {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    bucket: 'graph9.app',
    region: 'us-east-1'
  }

  ENV['s3-index'] = {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    bucket: 'graph9.app',
    region: 'us-east-1',
    allowOverwrite: true
  }

  ENV['cloudfront'] = {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    distribution: 'E3Q68FTRWHA4F'
  }

  if (deployTarget === 'development') {
    ENV.build.environment = 'development'
    // configure other plugins for development deploy target here
  }

  if (deployTarget === 'staging') {
    ENV.build.environment = 'production'
    // configure other plugins for staging deploy target here
  }

  if (deployTarget === 'production') {
    ENV.build.environment = 'production'
    // configure other plugins for production deploy target here
  }

  // Note: if you need to build some configuration asynchronously, you can return
  // a promise that resolves with the ENV object instead of returning the
  // ENV object synchronously.
  return ENV
}
