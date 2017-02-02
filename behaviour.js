// @flow
import { check, test } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

const defaults = {
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  insecure: false,
  systemId: '0',
  updatedAt: 'updatedAt',
  updatedBy: 'updatedBy',
};

export default function behaviour(args) {
  if (test(args, Mongo.Collection)) {
    args.collection = args;
  }

  const { collection, options = {} } = args;

  check(collection, Mongo.Collection);
  check(options, Object);

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

  const handle = {
    remove() {
      beforeInsertHandle.remove();
      beforeUpdateHandle.remove();
    },
  };

  return handle;
}
