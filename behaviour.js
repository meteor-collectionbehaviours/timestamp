// @flow
import { check, test } from 'meteor/check';
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
  if (test(argument, Mongo.Collection)) {
    argument = {
      collection: argument
    };
  }

  const { collection, options = {} } = argument;

  check(collection, Mongo.Collection);
  check(options, Object);

  if (collection[symbol]) {
    throw new TimestampError('The timestamp behaviour has already been added to this collection.');
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

  const beforeInsertHandle = collection.before.insert(function timestampBeforeInsert(
    userId = systemId,
    doc,
  ) {
    if (createdAt && (doc[createdAt] == null || (doc[createdAt] && Meteor.isServer && !insecure))) {
      doc[createdAt] = new Date();
    }

    if (createdBy && (doc[createdBy] == null || (doc[createdBy] && Meteor.isServer && !insecure))) {
      doc[createdBy] = userId;
    }
  });

  const beforeUpdateHandle = collection.before.update(function timestampBeforeUpdate(
    userId = systemId,
    doc,
    fieldNames,
    modifier,
  ) {
    const { $set = {} } = modifier;

    if (updatedAt && ($set[updatedAt] == null || ($set[updatedAt] && Meteor.isServer && !insecure))) {
      $set[updatedAt] = new Date();
    }

    if (updatedBy && ($set[updatedBy] == null || ($set[updatedBy] && Meteor.isServer && !insecure))) {
      $set[updatedBy] = userId;
    }
  });

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
