import { BaseEntity, Config, type DefineConfig } from '@mikro-orm/core';

export abstract class Base extends BaseEntity {

  [Config]?: DefineConfig<{ forceObject: false }>;

}
