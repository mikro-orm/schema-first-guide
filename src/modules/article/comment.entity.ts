import { Embedded, Entity, ManyToOne, PrimaryKey, Property, type Rel } from '@mikro-orm/core';
import { Article } from '../article/article.customEntity.js';
import { Base } from '../common/base.entity.js';
import { Track } from '../common/track.entity.js';
import { User } from '../user/user.entity.js';

@Entity({ tableName: 'comments' })
export class Comment extends Base {

  @PrimaryKey({ type: 'integer' })
  id!: number;

  @Property({ type: 'string', length: 1000 })
  text!: string;

  @ManyToOne({ entity: () => Article, fieldName: 'article', index: 'fk_comment_article1_idx' })
  article!: Rel<Article>;

  @ManyToOne({ entity: () => User, fieldName: 'author', index: 'fk_comment_user1_idx' })
  author!: Rel<User>;

  @Embedded({ entity: () => Track, prefix: false, nullable: true })
  _track?: Rel<Track>;

}
