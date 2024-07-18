import { type Platform, type TransformContext, Type } from '@mikro-orm/core';
import { Password } from './password.runtimeType.js';

export class PasswordType extends Type<Password, string> {
  convertToJSValue(value: string, platform: Platform): Password {
    return Password.fromHash(value);
  }

  convertToDatabaseValue(
    value: Password,
    platform: Platform,
    context?: TransformContext,
  ): string {
    return `${value}`;
  }

  compareAsType() {
    return 'string';
  }
}
