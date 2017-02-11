// @flow
import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import TimestampError from './error';

const defaults = {
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  insecure: false,
  systemId: '0',
  updatedAt: 'updatedAt',
  updatedBy: 'updatedBy',
};

const symbol = Symbol('collectionbehaviours:timestamp');

export default function behaviour(argument = {}) {
  if (Match.test(argument, Mongo.Collection)) {
    argument = {
      collection: argument,
    };
  }

  const { collection, options = {} } = argument;

  check(collection, Mongo.Collection);
  check(options, Object);

  if (collection[symbol]) {
    // eslint-disable-next-line no-underscore-dangle
    const collectionName = collection._name ? ` (${collection._name})` : '';
    const message = `The timestamp behaviour has already been added to this collection${collectionName}.`;
    throw new TimestampError(message);
  }

  const {
    createdAt,
    createdBy,
    insecure,
    systemId,
    updatedAt,
    updatedBy,
  } = {
    ...defaults,
    ...options,
  };

  check(createdAt, String);
  check(createdBy, String);
  check(insecure, Boolean);
  check(systemId, String);
  check(updatedAt, String);
  check(updatedBy, String);

  function beforeInsertHook(userId = systemId, doc) {
    if (createdAt && (doc[createdAt] == null || (doc[createdAt] && Meteor.isServer && !insecure))) {
      doc[createdAt] = new Date();
    }

    if (createdBy && (doc[createdBy] == null || (doc[createdBy] && Meteor.isServer && !insecure))) {
      doc[createdBy] = userId;
    }
  }

  const beforeInsertHandle = collection.before.insert(beforeInsertHook);

  function beforeUpdateHook(userId = systemId, doc, fieldNames, modifier) {
    if (!modifier) {
      return;
    }

    const isDocument = !Object.keys(modifier).find(key => key.startsWith('$'));

    if (isDocument) {
      if (createdAt && (modifier[createdAt] == null || (modifier[createdAt] && Meteor.isServer && !insecure))) {
        modifier[createdAt] = new Date();
      }

      if (createdBy && (modifier[createdBy] == null || (modifier[createdBy] && Meteor.isServer && !insecure))) {
        modifier[createdBy] = userId;
      }
    } else {
      const { $set = {} } = modifier;

      if (updatedAt && ($set[updatedAt] == null || ($set[updatedAt] && Meteor.isServer && !insecure))) {
        $set[updatedAt] = new Date();
      }

      if (updatedBy && ($set[updatedBy] == null || ($set[updatedBy] && Meteor.isServer && !insecure))) {
        $set[updatedBy] = userId;
      }

      if (!Object.keys($set).length) {
        delete modifier.$set;
      }
    }
  }

  const beforeUpdateHandle = collection.before.update(beforeUpdateHook);

    }

    }
  }


  collection[symbol] = true;

  const handle = {
    remove() {
      beforeInsertHandle.remove();
      beforeUpdateHandle.remove();
      delete collection[symbol];
    },
  };

  return handle;
}
