import { PaginationData } from "./database/datastore/datastore";

export class Utils {
  public static paginate<T>(data: T[], pagination: PaginationData): T[] {
    return data.slice(pagination.skip, pagination.skip + pagination.take)
  }
}