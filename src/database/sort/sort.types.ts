
type FilterFlags<T> = {
  [Key in keyof T]?: T[Key] extends Function ? never : Key
}

type AllowedFlags<T> = FilterFlags<T>[keyof T]

export type ISortFunction<T> = (first: T, second: T) => number;

export enum SortDirection {
  Ascending = 1,
  Descending = -1
}

export interface ISortField<T> {
  sort: ISortFunction<T> | SortDirection;
  priority?: number;
}

export type ISort<T> = {
  [P in keyof Pick<T, AllowedFlags<T>>]?: ISortField<T[P]>;
}

