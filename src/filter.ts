import { IFilter } from "./types";

export class FilterOperator<T> {
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
    for(const key in value) {
      if(!this.filterObject[key])  continue;
      const valueToCheck = value[key]
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
}