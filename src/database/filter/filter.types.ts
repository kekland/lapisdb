
type FilterFlags<T> = {
  [Key in keyof T]?: T[Key] extends Function ? never : Key
}

type AllowedFlags<T> = FilterFlags<T>[keyof T]

export type IFilter<T> = {
  [P in keyof Pick<T, AllowedFlags<T>>]?: IFieldFilter<T[P]> | T[P];
}


export interface IFieldFilter<T> {
  operator: 'equal' | 'eq' | 'greater' | 'gt';
  value: T;
}
