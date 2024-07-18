import { Entity, ManyToOne, PrimaryKeyProp, type Rel } from '@mikro-orm/core';
import { Article } from '../article/article.customEntity.js';
import { Base } from '../common/base.entity.js';
import { Tag } from '../article/tag.entity.js';

@Entity({ tableName: 'article_tags' })
export class ArticleTag extends Base {

  [PrimaryKeyProp]?: ['article', 'tag'];

  @ManyToOne({ entity: () => Article, primary: true })
  article!: Rel<Article>;

  @ManyToOne({ entity: () => Tag, primary: true, index: 'fk_article_tag_tag1_idx' })
  tag!: Rel<Tag>;

}
