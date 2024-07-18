import { Embeddable, Property, type Opt } from '@mikro-orm/mysql';

@Embeddable()
export class Social {
  @Property({ type: 'string' })
  twitter!: string & Opt;

  @Property({ type: 'string' })
  facebook!: string & Opt;

  @Property({ type: 'string' })
  linkedin!: string & Opt;
}
