import { Model } from '../model';

export class Human extends Model<Human> {
  name: string;

  constructor(name: string) {
    super()
    this.name = name
  }
}
