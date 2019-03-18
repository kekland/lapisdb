import { PaginationData } from "./database/datastore/datastore";

/**
 * Utils functions.
 */
export class Utils {
  /**
   * Paginates an array of objects.
   * @param data Data to paginate.
   * @param pagination Pagination data (skip and take values).
   * @returns Paginated `data`.
   */
  public static paginate<T>(data: T[], pagination: PaginationData): T[] {
    return data.slice(pagination.skip, pagination.skip + pagination.take)
  }
}