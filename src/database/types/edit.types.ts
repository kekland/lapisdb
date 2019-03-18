import { IObjectMetadata } from "../model/model";

type FilterFlags<T> = {
  [Key in keyof T]: T[Key] extends Function ? never : 
                    T[Key] extends IObjectMetadata ? never :
                    Key
}

type AllowedFlags<T> = FilterFlags<T>[keyof T]

export type IEdit<T> = {
  [P in keyof Pick<T, AllowedFlags<T>>]?: T[P];
}