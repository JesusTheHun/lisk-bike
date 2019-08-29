import * as lisk from '../lisk-client';
import { env } from '../config/env';
import moment from 'moment';

export const buildActions = (namespace, actions) => {
  let typedObject = {};

  Object.keys(actions).forEach(actionName => {
    const type = namespace + '_' + actionName;

    if (typeof actions[actionName] === 'function') {

      typedObject[actionName] = (...args) => {
        let actionResult = actions[actionName].apply(actions, args) || {};
        actionResult.type = type;

        // Wrap around the thunk to handle errors in a centralized manner
        if (typeof actionResult === 'function') {
          const thunkWrap = (...args) => {
            try {
              let output = actionResult(...args);

              if (output instanceof Promise) {
                return output.catch(err => {
                  if (env.DEBUG) {
                    console.error(
                      `Action ${type} was executed, the Promise failed with the error : ${err}`
                    );
                    throw err;
                  }
                });
              }

              return output;
            } catch (err) {
              if (env.DEBUG) {
                console.error(
                  `Action ${type} was executed, resulting in error : ${err}`
                );
                throw err;
              }
            }
          };

          thunkWrap.type = type;

          return thunkWrap;
        }

        return actionResult;
      };
      typedObject[actionName].type = type;
      return;
    }

    if (typeof actions[actionName] === 'object') {
      typedObject[actionName] = buildActions(
        namespace + '_' + actionName,
        actions[actionName]
      );
      return;
    }

    throw new Error(
      'buildActions props must be functions or object (of objects)* of functions'
    );
  });

  return typedObject;
};

export const dateToLiskEpochTimestamp = date => (
    Math.floor(new Date(date).getTime() / 1000) - lisk.constants.EPOCH_TIME_SECONDS
);

export const liskEpochTimestampToDate = timestamp => (
    new Date((timestamp + lisk.constants.EPOCH_TIME_SECONDS) * 1000)
);

export const formatTimestamp = timestamp => (
    moment(liskEpochTimestampToDate(timestamp)).fromNow()
);

export const formatServerError = err => (
    `${err}${err.errors && err.errors.map ? `:\n ${err.errors.map(({ message }) => message).join('\n ')}` : ''}`
);

export const humanReadableDistance = distance => distance > 1000 ?
    `${Number(distance / 1000).toFixed(2)} km` :
    `${distance} m`;
