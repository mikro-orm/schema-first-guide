import {
  type FastifyPluginAsync,
  type FastifySchema,
  type RouteGenericInterface,
} from 'fastify';
import { type Services } from '../../db.js';
import { pagingParams } from '../common/validators.js';
import { getUserFromToken } from '../common/utils.js';
import { z } from 'zod';
import { DisallowedError } from '../common/disallowed.error.js';
import { wrap } from '@mikro-orm/mysql';

export default (async (app, { db }) => {
  app.get('/', async (request) => {
    const { limit, offset } = pagingParams.parse(request.query);
    const [items, total] = await db.article.findAndCount(
      {},
      {
        populate: ['commentsCount'],
        limit,
        offset,
      },
    );

    return { items, total };
  });

  const articleBySlugParams = z.object({
    slug: z.string().min(1),
  });

  app.get('/:slug', async (request) => {
    const { slug } = articleBySlugParams.parse(request.params);
    return db.article.findOneOrFail(
      { slug },
      {
        populate: ['author', 'commentCollection.author', 'text'],
      },
    );
  });

  const articleCommentPayload = z.object({
    text: z.string().min(1),
  });

  app.post('/:slug/comment', async (request) => {
    const { slug } = articleBySlugParams.parse(request.params);
    const { text } = articleCommentPayload.parse(request.body);
    const author = getUserFromToken(request);
    const article = await db.article.findOneOrFail({ slug });
    const comment = db.comment.create({ author, article, text });

    // We can add the comment to `article.comments` collection,
    // but in fact it is a no-op, as it will be automatically
    // propagated by setting Comment.author property.
    article.commentCollection.add(comment);

    // mention we don't need to persist anything explicitly
    await db.em.flush();

    return comment;
  });

  const newArticlePayload = z.object({
    title: z.string().min(1),
    text: z.string().min(1),
    description: z.string().min(1).optional(),
  });

  app.post('/', async (request) => {
    const { title, text, description } = newArticlePayload.parse(request.body);
    const author = getUserFromToken(request);
    const article = db.article.create({
      title,
      text,
      author,
      description,
    });

    await db.em.flush();

    return article;
  });

  const articleByIdParams = z.object({
    id: z.coerce.number().int().positive(),
  });
  const updateArticlePayload = newArticlePayload.partial().extend({
    slug: z.string().min(1).optional(),
  });

  app.patch('/:id', async (request) => {
    const user = getUserFromToken(request);
    const { id } = articleByIdParams.parse(request.params);
    const article = await db.article.findOneOrFail(id);
    if (article.author !== user) {
      throw new DisallowedError(
        'Only the author of an article is allowed to update it',
      );
    }
    wrap(article).assign(updateArticlePayload.parse(request.body));
    await db.em.flush();

    return article;
  });

  app.delete('/:id', async (request) => {
    const user = getUserFromToken(request);
    const { id } = articleByIdParams.parse(request.params);
    const article = await db.article.findOne(id);

    if (!article) {
      return { notFound: true };
    }

    if (article.author !== user) {
      throw new DisallowedError(
        'Only the author of an article is allowed to delete it',
      );
    }
    // mention `nativeDelete` alternative if we don't care about validations much
    await db.em.remove(article).flush();

    return { success: true };
  });
}) as FastifyPluginAsync<{ db: Services }>;
