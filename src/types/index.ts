export type JsonLogicValue = 
  | { [key: string]: JsonLogicValue }
  | string
  | number
  | boolean
  | null
  | JsonLogicValue[]; 