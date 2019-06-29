export interface IModelMetadata {
  id?: string;
  created?: number;
  updated?: number;
}

export interface IEmptyModelMetadata extends IModelMetadata {
  id?: string;
  created?: number;
  updated?: number;
}

export interface IFilledModelMetadata extends IModelMetadata {
  id: string;
  created: number;
  updated: number;
}
