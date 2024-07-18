import {
  type EntityManager,
  type EntityRepository,
  type GetRepository,
  MikroORM,
  type Options,
} from '@mikro-orm/mysql';
import config from './mikro-orm.config.js';
import { Article } from './modules/article/article.customEntity.js';
import { Tag } from './modules/article/tag.entity.js';
import { User } from './modules/user/user.entity.js';
import { Comment } from './modules/article/comment.entity.js';

export interface Services {
  orm: MikroORM;
  em: EntityManager;
  user: GetRepository<User, EntityRepository<User>>;
  article: GetRepository<Article, EntityRepository<Article>>;
  tag: GetRepository<Tag, EntityRepository<Tag>>;
  comment: GetRepository<Comment, EntityRepository<Comment>>;
}

let cache: Services;

export async function initORM(options?: Options): Promise<Services> {
  if (cache) {
    return cache;
  }

  const orm = await MikroORM.init({
    ...config,
    ...options,
  });

  return (cache = {
    orm,
    em: orm.em,
    user: orm.em.getRepository(User),
    article: orm.em.getRepository(Article),
    tag: orm.em.getRepository(Tag),
    comment: orm.em.getRepository(Comment),
  });
}
