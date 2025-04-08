declare module 'json-logic-js' {
  interface JsonLogicRule {
    [key: string]: any;
  }

  interface JsonLogic {
    apply(logic: JsonLogicRule, data?: any): boolean;
  }

  const jsonLogic: JsonLogic;
  export default jsonLogic;
} 