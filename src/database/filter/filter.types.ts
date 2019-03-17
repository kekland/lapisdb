
type FilterFlags<T> = {
  [Key in keyof T]: T[Key] extends Function ? never : Key
}

type AllowedFlags<T> = FilterFlags<T>[keyof T]

export type IFilter<T> = {
  [P in keyof Pick<T, AllowedFlags<T>>]: T[P];
}