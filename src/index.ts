import 'reflect-metadata'

import { DatastoreAdapter } from './lapisdb/datastore/adapters/adapter'

import { ClassType } from './lapisdb/datastore/interfaces/class.type'
import { FilterMethod } from './lapisdb/datastore/interfaces/filter.type'
import { IPaginationData } from './lapisdb/datastore/interfaces/pagination.type'
import { LevelIterator, ModelIterable } from './lapisdb/datastore/interfaces/model.iterator'

import { Datastore } from './lapisdb/datastore/datastore'

import { Model } from './lapisdb/model/model'
import { IEmptyModelMetadata, IFilledModelMetadata, IModelMetadata } from './lapisdb/model/model.metadata'

import { GetOperation } from './lapisdb/operations/get.operation'
import { PushOperation, BatchedPushOperation } from './lapisdb/operations/push.operation'
import { DeleteOperation, BatchedDeleteOperation } from './lapisdb/operations/delete.operation'

export {
  DatastoreAdapter,
  ClassType,
  FilterMethod,
  IPaginationData,
  LevelIterator,
  ModelIterable,
  Datastore,
  Model,
  IEmptyModelMetadata,
  IFilledModelMetadata,
  IModelMetadata,
  GetOperation,
  PushOperation,
  BatchedPushOperation,
  DeleteOperation,
  BatchedDeleteOperation,
}
