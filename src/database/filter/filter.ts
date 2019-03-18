import { IFilter } from "./filter.types";

//! Legacy
/*export class FilterOperator<T> {
  run(value: T): boolean {
    return true
  }
}

export class BaseFilter<T> implements FilterOperator<T> {
  filter: FilterOperator<T>;

  run(value: T): boolean {
    return this.filter.run(value)
  }

  constructor(filter: (FilterOperator<T>)) {
    this.filter = filter
  }
}

export class Or<T> implements FilterOperator<T> {
  filters: FilterOperator<T>[];

  run(value: T): boolean {
    const results: boolean[] = this.filters.map((filter) => filter.run(value))
    let result = false
    for(const filterResult of results) {
      result = result || filterResult;
    }
    return result
  }

  constructor(...filters: (FilterOperator<T>)[]) {
    this.filters = filters
  }
}

export class And<T> implements FilterOperator<T> {
  filters: FilterOperator<T>[];

  run(value: T): boolean {
    const results: boolean[] = this.filters.map((filter) => filter.run(value))
    let result = true
    for(const filterResult of results) {
      result = result && filterResult;
    }
    return result
  }

  constructor(...filters: (FilterOperator<T>)[]) {
    this.filters = filters
  }
}

export class Not<T> implements FilterOperator<T> {
  filter: FilterOperator<T>;

  run(value: T): boolean {
    return !this.filter.run(value)
  }

  constructor(filter: FilterOperator<T>) {
    this.filter = filter
  }
}

export class Filter<T, K extends T> implements FilterOperator<T> {
  filterObject: IFilter<K>; 

  run(value: T): boolean {
    for(const key in this.filterObject) {
      const valueToCheck = value[key]
      if(typeof this.filterObject[key] == typeof valueToCheck) {
        return this.filterObject[key] === valueToCheck
      }
      
      const operator = this.filterObject[key].operator
      const valueFilter = this.filterObject[key].value
      
      let pass = true
      switch(operator) {
        case 'eq': pass = valueToCheck == valueFilter; break;
        case 'equal': pass = valueToCheck == valueFilter; break;
        case 'greater': pass = valueToCheck > valueFilter; break;
        case 'gt': pass = valueToCheck > valueFilter; break;
      }

      if(!pass) {
        return false
      }
    }

    return true
  }

  constructor(filterObject: IFilter<K>) {
    this.filterObject = filterObject
  }
}*/

/**
 * A class that holds the **filter** method and runs the filter on given value.
 *
 * @typeparam T Type of the object that filter will be run against.
 */
export class FilterOperator<T> {
  /** The filtering method. */
  private method: (value: IFilter<T>) => boolean;
  
  /**
   * Runs the filter against `value`, and returns `true` if the value
   * passes the filter, `false` otherwise.
   * 
   * @param value An object to run filter against
   * @returns Did the object pass the filter?
   */
  run(value: T): boolean {
    return this.method(value)
  }

  /**
   * Creates an instance of FilterOperator.
   * @param method The filtering method.
   * @memberof FilterOperator
   */
  constructor(method: (value: IFilter<T>) => boolean) {
    this.method = method
  }
}