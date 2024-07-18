import { Collection, Embedded, Entity, ManyToMany, PrimaryKey, Property, type Rel } from '@mikro-orm/core';
import { Article } from '../article/article.customEntity.js';
import { Base } from '../common/base.entity.js';
import { Track } from '../common/track.entity.js';

@Entity({ tableName: 'tags' })
export class Tag extends Base {

  @PrimaryKey({ type: 'integer' })
  id!: number;

  @Property({ type: 'string', length: 20 })
  name!: string;

  @Embedded({ entity: () => Track, prefix: false, nullable: true })
  _track?: Rel<Track>;

  @ManyToMany({ entity: () => Article, mappedBy: 'articleTags' })
  articleTagsInverse = new Collection<Article>(this);

}
