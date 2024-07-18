import { Collection, Embedded, Entity, Formula, ManyToMany, ManyToOne, OneToMany, type Opt, PrimaryKey, Property, type Rel, Unique } from '@mikro-orm/core';
import { ArticleTag } from '../article/articletag.entity.js';
import { Base } from '../common/base.entity.js';
import { Comment } from '../article/comment.entity.js';
import { Tag } from '../article/tag.entity.js';
import { Track } from '../common/track.entity.js';
import { User } from '../user/user.entity.js';

@Entity({ tableName: 'articles', abstract: true })
export abstract class _Article extends Base {

  @PrimaryKey({ type: 'integer' })
  id!: number;

  @Unique({ name: 'slug_UNIQUE' })
  @Property({ type: 'string' })
  slug!: string;

  @Property({ type: 'string' })
  title!: string;

  @Property({ type: 'string', length: 1000 })
  description!: string;

  @Property({ type: 'text', length: 65535, lazy: true })
  text!: string;

  @ManyToOne({ entity: () => User, fieldName: 'author', index: 'fk_article_user1_idx' })
  author!: Rel<User>;

  @Formula((alias) => "(select count(*) from `comments` where `article` = ??.`id`)".replaceAll('??', alias), { type: 'integer', unsigned: true, lazy: true })
  commentsCount: number & Opt = 0;

  @Embedded({ entity: () => Track, prefix: false, nullable: true })
  _track?: Rel<Track>;

  @ManyToMany({ entity: () => Tag, pivotTable: 'article_tags', pivotEntity: () => ArticleTag, joinColumn: 'article_id', inverseJoinColumn: 'tag_id' })
  articleTags = new Collection<Tag>(this);

  @OneToMany({ entity: () => Comment, mappedBy: 'article' })
  commentCollection = new Collection<Comment>(this);

}
