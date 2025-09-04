import { registerDecorator, ValidationOptions } from "class-validator";

export function IsStellarPublicKey(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isStellarPublicKey",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== "string") return false;
          return /^G[A-Z2-7]{55}$/.test(value); // formato Stellar
        },
        defaultMessage() {
          return "Wallet must be a valid Stellar public key (starts with G, 56 chars base32)";
        },
      },
    });
  };
}
