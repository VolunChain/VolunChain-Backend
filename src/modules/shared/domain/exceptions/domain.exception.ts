export abstract class DomainException extends Error {
  public readonly name: string;
  public readonly statusCode: number;
  public readonly errorCode: string;

  constructor({
    message,
    errorCode,
    statusCode,
  }: {
    message: string;
    errorCode: string;
    statusCode: number;
  }) {
    super(message);
    this.name = new.target.name;
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
