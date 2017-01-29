// @flow
Package.describe({
  documentation: 'README.md',
  git: 'git+https://github.com/meteor-collectionbehaviours/timestamp.git',
  name: 'collectionbehaviours:timestamp',
  summary: 'Automatically timestamp documents in your collections',
  version: '1.0.0-alpha.1',
});

Package.onUse(function onUse(api) {
  api.versionsFrom('1.4.2.2');

  api.use([
    'ecmascript',
  ]);
});