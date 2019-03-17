import { Model } from '../model';

export class Human extends Model<Human> {
  name: string;
  lastName?: string;
  age: number;
  objects: string[];

  constructor(name: string, age: number, objects: string[], lastName?: string) {
    super()
    this.name = name
    this.lastName = lastName
    this.age = age
    this.objects = objects
  }
}
