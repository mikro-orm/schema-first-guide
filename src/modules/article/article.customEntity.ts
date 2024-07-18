import { Entity, OptionalProps, type Rel } from '@mikro-orm/core';
import { _Article } from './article.entity.js';
import { User } from '../user/user.entity.js';
import { Track } from '../common/track.entity.js';

function convertToSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

@Entity({ tableName: 'articles' })
export class Article extends _Article {
  [OptionalProps]?: 'slug' | 'description';

  constructor(title: string, text: string, author: Rel<User>) {
    super();
    this.title = title;
    this.text = text;
    this.author = author;
    this.slug = convertToSlug(title);
    this.description = this.text.substring(0, 999) + '…';
  }
}
