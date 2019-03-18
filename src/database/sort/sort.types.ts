
type FilterFlags<T> = {
  [Key in keyof T]?: T[Key] extends Function ? never : Key
}

type AllowedFlags<T> = FilterFlags<T>[keyof T]

/** 
 * Comparator function. Takes two inputs.
 */
export type IComparator<T> = (first: T, second: T) => number;

/** 
 * Direction of sort.
 */
export enum SortDirection {
  Ascending = 1,
  Descending = -1
}

/**
 * Instructions on how to sort a field of an object.
 */
export interface ISortField<T> {
  /** 
   * `sort` can be either a function that compares two items (comparator),
   * or can be a SortDirection enum, which sets the direction of a sort.
   */
  sort: IComparator<T> | SortDirection;

  /** 
   * Priority of this field. Defaults to 0.
   */
  priority?: number;
}

/** 
 * Instructions on how to sort an object `T`.
 * All of the fields of this object are optional.
 * 
 * #### Usage
 * 
 * See more at [[GetOperation.sort]]
 */
export type ISort<T> = {
  [P in keyof Pick<T, AllowedFlags<T>>]?: ISortField<T[P]>;
}

