export type IFilter<T> = {
  [P in keyof T]?: IFieldFilter<T[P]>;
}

export interface IFieldFilter<T> {
  operator: 'equal' | 'eq' | 'greater' | 'gt';
  value: T;
}
