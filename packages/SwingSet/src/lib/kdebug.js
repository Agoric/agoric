let enableKDebug = false;

export function kdebugEnable(flag) {
  enableKDebug = !!flag;
}

export function kdebug(...args) {
  if (enableKDebug) {
    console.log(...args);
  }
}

export function legibilizeValue(val, slots, smallcaps) {
  try {
    if (Array.isArray(val)) {
      let result = '[';
      for (const elem of val) {
        if (result.length !== 1) {
          result += ', ';
        }
        result += legibilizeValue(elem, slots, smallcaps);
      }
      result += ']';
      return result;
    } else if (val && typeof val === 'object' && val.constructor === Object) {
      const qClass = val['@qclass'];
      if (qClass && !smallcaps) {
        switch (qClass) {
          case 'undefined':
          case 'NaN':
          case 'Infinity':
          case '-Infinity':
            return qClass;
          case 'bigint':
            return val.digits;
          case 'slot':
            return `@${slots[val.index]}`;
          case 'error':
            return `new ${val.name}('${val.message}')`;
          default:
            // unknown qClass, treat it like any other object literal
            break;
        }
      }
      let result = '{';
      for (const prop of Object.getOwnPropertyNames(val)) {
        if (result.length !== 1) {
          result += ', ';
        }
        // prettier-ignore
        result += `${String(prop)}: ${legibilizeValue(val[prop], slots, smallcaps)}`;
      }
      result += '}';
      return result;
    } else if (val && typeof val === 'string' && smallcaps) {
      const prefix = val.charAt(0);
      const rest = val.substring(1);
      switch (prefix) {
        case '!':
          return `"${rest}"`;
        case '%':
          return `[${rest}]`;
        case '#':
        case '+':
        case '-':
          return rest;
        case '$':
        case '&': {
          const end = rest.indexOf('.');
          const idx = Number(rest.slice(0, end < 0 ? rest.length : end));
          return `@${slots[idx]}`;
        }
        default:
          return JSON.stringify(val) || '<unintelligible value>';
      }
    } else {
      return JSON.stringify(val) || '<unintelligible value>';
    }
  } catch {
    return '<unintelligible value>';
  }
}

export function legibilizeMethod(method, smallcaps) {
  try {
    if (typeof method === 'string') {
      if (!smallcaps) {
        return method;
      }
      const prefix = method.charAt(0);
      const rest = method.substring(1);
      switch (prefix) {
        case '%':
          return `[${rest}]`;
        case '#':
          if (rest === 'undefined') {
            return '<funcall>';
          } else {
            return '<unintelligible method>';
          }
        case '!':
          return rest;
        case '+':
        case '-':
        case '$':
        case '&':
          return '<unintelligible method>';
        default:
          return method;
      }
    } else if (method === undefined) {
      return '<funcall>';
    } else if (typeof method === 'object') {
      if (smallcaps) {
        return '<unintelligible method>';
      }
      const qclass = method['@qclass'];
      if (qclass === 'undefined') {
        return '<funcall>';
      } else {
        return '<invalid method type>';
      }
    } else {
      return '<unintelligible method>';
    }
  } catch {
    return '<unintelligible method>';
  }
}

export function extractMethod(methargsCapdata) {
  try {
    let smallcaps = false;
    let bodyString = methargsCapdata.body;
    if (bodyString.charAt(0) === '#') {
      smallcaps = true;
      bodyString = bodyString.substring(1);
    }
    const methargs = JSON.parse(bodyString);
    return legibilizeMethod(methargs[0], smallcaps);
  } catch {
    return '<unknown>';
  }
}

export function legibilizeMessageArgs(methargsCapdata) {
  try {
    let smallcaps = false;
    let bodyString = methargsCapdata.body;
    if (bodyString.charAt(0) === '#') {
      smallcaps = true;
      bodyString = bodyString.substring(1);
    }
    const methargs = JSON.parse(bodyString);
    const [method, args] = methargs;
    const methodStr = legibilizeMethod(method, smallcaps);
    const argsStrs = args.map(arg =>
      legibilizeValue(arg, methargsCapdata.slots, smallcaps),
    );
    return [methodStr, argsStrs.join(', ')];
  } catch {
    return '<unintelligible message args>';
  }
}
