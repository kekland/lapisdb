import { ISort, ISortFunction, SortDirection, ISortField } from "./sort.types";

export class SortOperator<T> {
  sort: ISort<T>

  constructor(sort: ISort<T>) {
    this.sort = sort
  }

  private isFieldFunction(field: any): field is ISortFunction<T> {
    return typeof field == 'function'
  }

  run(values: T[]): T[] {
    return values.sort((a: T, b: T) => {
      let results: Map<number, number[]> = new Map()

      for (const sortKey in this.sort) {
        const sortWith: ISortField<T> = this.sort[sortKey]

        const aField = a[sortKey]
        const bField = b[sortKey]

        let priority = 0;
        let result = 0;

        if(this.isFieldFunction(sortWith.sort)) {
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
        for (const result of resultsArray) {
          if (result != 0) {
            return result
          }
        }
      }
      return 0
    })
  }
}