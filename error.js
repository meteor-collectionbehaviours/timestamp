// @flow
export default class TimestampError extends Error {
  constructor() {
    super();
    this.name = 'collectionbehaviours:timestamp';
  }
}
