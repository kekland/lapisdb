import { IObjectMetadata } from "../model/model";

type FilterFlags<T> = {
  [Key in keyof T]: T[Key] extends Function ? never : 
                    T[Key] extends IObjectMetadata ? never :
                    Key
}

type AllowedFlags<T> = FilterFlags<T>[keyof T]

/** 
 * In a nutshell, this type returns the `T` without functions and metadata fields. 
 * Useful when setting the fields to edit in the object.
 * All of the fields in this type are optional.
 */
export type IEdit<T> = {
  [P in keyof Pick<T, AllowedFlags<T>>]?: T[P];
}