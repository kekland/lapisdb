import { ISort, IComparator, SortDirection, ISortField } from "./sort.types";

/**
 * A class that holds the sorting data and sorts an array of objects.
 */
export class SortOperator<T> {
  /** Sorting instructions */
  sort: ISort<T>

  /**
   * Creates an instance of SortOperator.
   * @param sort Sorting instructions.
   */
  constructor(sort: ISort<T>) {
    this.sort = sort
  }


  /**
   * Is `field` a function?
   * @param field The field to check.
   * @returns If the field is function, returns `true`.
   */
  private isFieldFunction(field: any): field is IComparator<T> {
    return typeof field == 'function'
  }

  /**
   * Runs the sorting process. Uses JavaScript's `Array.sort()`.
   *
   * @param values What to sort
   * @returns Sorted array
   */
  run(values: T[]): T[] {
    return values.sort((a: T, b: T) => {
      let results: Map<number, number[]> = new Map()

      for (const sortKey in this.sort) {
        const sortWith: ISortField<T> = (this.sort as any)[sortKey]

        const aField = (a as any)[sortKey]
        const bField = (b as any)[sortKey]

        let priority = 0;
        let result = 0;

        if (this.isFieldFunction(sortWith.sort)) {
          result = sortWith.sort(aField, bField)
        }
        else {
          result = (aField > bField ? 1 : (aField < bField) ? -1 : 0) * (sortWith.sort as number)
        }

        if (sortWith.priority) {
          priority = sortWith.priority
        }

        const arr = results.get(priority)
        if (arr) {
          results.set(priority, [result, ...arr])
        }
        else {
          results.set(priority, [result])
        }
      }

      const priorities = results.keys()
      let prioritiesArray: number[] = []

      for (const priority of priorities) {
        prioritiesArray.push(priority)
      }
      prioritiesArray.sort((a, b) => b - a)

      for (const priority of prioritiesArray) {
        const resultsArray = results.get(priority)
        if (resultsArray != null) {
          for (const result of resultsArray) {
            if (result != 0) {
              return result
            }
          }
        }
      }
      return 0
    })
  }
}