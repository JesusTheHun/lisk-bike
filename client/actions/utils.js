/* eslint-disable */

import config from 'config/global';

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
                  if (config.DEBUG) {
                    console.error(
                      `Action ${type} was executed, the Promise failed with the error : ${err}`
                    );
                    throw err;
                  }
                });
              }

              return output;
            } catch (err) {
              if (config.DEBUG) {
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
