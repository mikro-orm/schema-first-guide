import { Embeddable, Property } from '@mikro-orm/decorators/legacy';
import { Base } from '../common/base.entity.js';

@Embeddable()
export class Track extends Base {

  @Property({ type: 'datetime', defaultRaw: `CURRENT_TIMESTAMP` })
  createdAt!: Date;

  @Property({ type: 'datetime', defaultRaw: `CURRENT_TIMESTAMP` })
  updatedAt!: Date;

}
