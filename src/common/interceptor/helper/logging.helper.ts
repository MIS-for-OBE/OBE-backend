import * as _ from 'lodash';

const markFieldPaths: () => string[] = () => [
  'data.password',
  'data.pinCode',
];

export function safeJsonStringify(
  value: any,
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number,
): string {
  try {
    return JSON.stringify(value, replacer, space);
  } catch (err) {
    return null;
  }
}

export function buildBodyPayload(body) {
  let cloneBody;
  if (_.isObject(body)) {
    markFieldPaths().forEach((path) => {
      if (!_.get(body, path)) {
        return;
      }

      if (!cloneBody) {
        cloneBody = _.cloneDeep(body);
      }
      _.set(cloneBody, path, '*****');
    });
  }
  return cloneBody ?? body;
}
