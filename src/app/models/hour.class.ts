import { Serializable } from './serializable.class';

export class Hour extends Serializable {
  
  public date: string;
  public consumption: number;
  public price: number;
  public cost: number;

  public getResourceName():string {
    return '/hour';
  };

}