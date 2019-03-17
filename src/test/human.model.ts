import { Model } from '../model';

export class Human extends Model<Human> {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    super()
    this.name = name
    this.age = age
  }
}
