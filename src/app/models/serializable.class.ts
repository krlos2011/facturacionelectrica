export abstract class Serializable {

  protected _id: string;

  // Not override constructor, override init instead
  constructor(json: any = {}) {
    this.init(json);
  }

  public abstract getResourceName(): string;

  public getId(): string {
    return this._id;
  };

  public init(json: any = {}) {
    for (var propName in json) {
      this[propName] = json[propName];
    }
  }
}