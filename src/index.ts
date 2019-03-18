import { Datastore } from "./database/datastore/datastore";
import { BatchedPushOperation, PushOperation } from "./database/operations/push.operation";
import { GetOperation } from "./database/operations/get.operation";
import { EditOperation } from "./database/operations/edit.operation";
import { DeleteOperation, BatchedDeleteOperation } from "./database/operations/delete.operation";
import { Model } from "./database/model/model";
import { FilterOperator } from "./database/filter/filter";
import { SortOperator } from "./database/sort/sort";
import { DatastoreOperations } from "./database/datastore/datastore.methods";
import { SortDirection } from "./database/sort/sort.types";

export {
  Datastore,
  DatastoreOperations,
  GetOperation,
  PushOperation,
  BatchedPushOperation,
  EditOperation,
  DeleteOperation,
  BatchedDeleteOperation,
  Model,
  FilterOperator,
  SortOperator,
  SortDirection
}