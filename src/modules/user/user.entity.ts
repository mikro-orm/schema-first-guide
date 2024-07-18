import { Collection, Embedded, Entity, EntityRepositoryType, type Hidden, type IType, OneToMany, PrimaryKey, Property, type Rel, Unique } from '@mikro-orm/core';
import { Article } from '../article/article.customEntity.js';
import { Base } from '../common/base.entity.js';
import { Comment } from '../article/comment.entity.js';
import { Password } from '../user/password.runtimeType.js';
import { PasswordType } from '../user/password.type.js';
import { Social } from '../user/social.customEntity.js';
import { Track } from '../common/track.entity.js';
import { UserRepository } from '../user/user.repository.js';

@Entity({ tableName: 'users', repository: () => UserRepository })
export class User extends Base {

  [EntityRepositoryType]?: UserRepository;

  @PrimaryKey({ type: 'integer' })
  id!: number;

  @Property({ type: 'string' })
  fullName!: string;

  @Unique({ name: 'email_UNIQUE' })
  @Property({ type: 'string' })
  email!: string;

  @Property({ type: PasswordType, columnType: 'varchar(255)', hidden: true, lazy: true })
  password!: IType<Password, string> & Hidden;

  @Property({ type: 'text', length: 65535 })
  bio!: string;

  @Embedded({ entity: () => Social, object: true, prefix: false, nullable: true })
  social?: Rel<Social>;

  @Embedded({ entity: () => Track, prefix: false, nullable: true })
  _track?: Rel<Track>;

  @Property({ type: 'string', nullable: true, persist: false })
  token?: string;

  @OneToMany({ entity: () => Article, mappedBy: 'author' })
  articleCollection = new Collection<Article>(this);

  @OneToMany({ entity: () => Comment, mappedBy: 'author' })
  commentCollection = new Collection<Comment>(this);

}
