# collectionbehaviours:timestamp

Automatically timestamp documents in your collections

## Install

```sh
meteor add collectionbehaviours:timestamp
```

## Usage

```js
import timestamp from 'meteor/collectionbehaviours:timestamp';
import { Mongo } from 'meteor/mongo';

const Authors = new Mongo.Collection('authors');
const Posts = new Mongo.Collection('posts');

// Add behaviour to single collection with default options
const handle = timestamp(Posts);

// Remove the behaviour from Posts
handle.remove();

// Add behaviour to single collection with custom options
const handle = timestamp({
  collection: Authors,
  options: {
    createdAt: 'madeAt',
    createdBy: 'insertedBy',
    updatedAt: 'modifiedAt',
    updatedBy: 'changedBy',
    systemId: Meteor.users.findOne({ name: 'System' })._id,
  }
});

// Remove behviour from Authors
handle.remove();

// Add behaviour to multiple collections with default options
const handles = [Authors, Posts].map(timestamp);

// Remove behaviour from Authors and Posts
handles.forEach((h) => { h.remove() });

// Add behaviour to multiple collections with custom options
const handles = [{
  collection: Authors,
  options: {
    createdAt: 'insertedAt',
  },
}, {
  collection: Posts,
  options: {
    systemId: Random.id(),
  },
}].map(timestamp);

// Remove behaviour from Authors and Posts
handles.forEach((h) => { h.remove() });
```

If you don't care about being able to remove the behaviour from your collections then you can use
`forEach` instead of `map`.
## Options

The default options are the following.

```js
options = {
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  updatedAt: 'updatedAt',
  updatedBy: 'updatedBy',
  insecure: false,
  systemId: 0,
};
```
