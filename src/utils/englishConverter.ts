interface JsonLogicRule {
  [key: string]: any;
}

export const convertToEnglish = (logic: JsonLogicRule): string => {
  const operators = {
    'and': 'AND',
    'or': 'OR',
    'not': 'NOT',
    '==': 'equals',
    '!=': 'does not equal',
    '>': 'is greater than',
    '>=': 'is greater than or equal to',
    '<': 'is less than',
    '<=': 'is less than or equal to',
    'in': 'is in',
    'nin': 'is not in',
    'var': 'variable',
    'missing': 'is missing',
    'missing_some': 'is missing some of',
    'all': 'all',
    'some': 'some',
    'none': 'none',
    'merge': 'combine',
    'cat': 'concatenate',
    'substr': 'substring',
    'log': 'log',
    '+': 'plus',
    '-': 'minus',
    '*': 'times',
    '/': 'divided by',
    '%': 'modulo',
    'min': 'minimum of',
    'max': 'maximum of'
  };

  const convertValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.map(convertValue).join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return convertToEnglish(value);
    }
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    return String(value);
  };

  const convertVar = (value: any): string => {
    if (Array.isArray(value) && value[0] === 'var') {
      return `the value of "${value[1]}"`;
    }
    return convertValue(value);
  };

  for (const [operator, value] of Object.entries(logic)) {
    if (operator in operators) {
      const op = operators[operator as keyof typeof operators];
      
      switch (operator) {
        case 'and':
        case 'or':
          return `(${value.map(convertToEnglish).join(` ${op} `)})`;
        
        case 'not':
          return `NOT (${convertToEnglish(value)})`;
        
        case '==':
        case '!=':
        case '>':
        case '>=':
        case '<':
        case '<=':
          return `${convertVar(value[0])} ${op} ${convertValue(value[1])}`;
        
        case 'var':
          return `the value of "${value}"`;
        
        case 'missing':
          return `${convertVar(value)} is missing`;
        
        case 'missing_some':
          return `${convertVar(value[0])} is missing some of ${convertValue(value[1])}`;
        
        case 'all':
        case 'some':
        case 'none':
          return `${op} of ${convertValue(value[0])} satisfy ${convertToEnglish(value[1])}`;
        
        case 'in':
        case 'nin':
          return `${convertVar(value[0])} ${op} ${convertValue(value[1])}`;
        
        case 'merge':
          return `combine ${convertValue(value)}`;
        
        case 'cat':
          return `concatenate ${convertValue(value)}`;
        
        case 'substr':
          return `substring of ${convertVar(value[0])} from ${value[1]} to ${value[2]}`;
        
        case 'log':
          return `log ${convertValue(value)}`;
        
        case '+':
        case '-':
        case '*':
        case '/':
        case '%':
          return value.map(convertValue).join(` ${op} `);
        
        case 'min':
        case 'max':
          return `${op} of ${convertValue(value)}`;
      }
    }
  }

  // If we can't convert it, return a string representation
  return JSON.stringify(logic, null, 2);
}; 