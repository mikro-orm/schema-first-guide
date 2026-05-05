import { type Opt } from '@mikro-orm/core';
import { Embeddable, Property } from '@mikro-orm/decorators/legacy';

@Embeddable()
export class Social {
  @Property({ type: 'string' })
  twitter!: string & Opt;

  @Property({ type: 'string' })
  facebook!: string & Opt;

  @Property({ type: 'string' })
  linkedin!: string & Opt;
}
