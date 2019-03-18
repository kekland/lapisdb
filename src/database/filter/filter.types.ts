
type FilterFlags<T> = {
  [Key in keyof T]: T[Key] extends Function ? never : Key
}

type AllowedFlags<T> = FilterFlags<T>[keyof T]

/** 
 * In a nutshell, this type returns the `T` without functions. Useful
 * for removing functions from `Model`, and leaving only the
 * value fields.
 */
export type IFilter<T> = {
  [P in keyof Pick<T, AllowedFlags<T>>]: T[P];
}