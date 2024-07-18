import { fastifyPlugin } from 'fastify-plugin';
import { type Services } from '../../db.js';
import { NotFoundError, RequestContext } from '@mikro-orm/mysql';
import { AuthError } from './auth.error.js';
import { DisallowedError } from './disallowed.error.js';
import { DuplicateUserError } from '../user/duplicate.error.js';

export default fastifyPlugin<{ db: Services }>(async (app, { db }) => {
  // register request context hook
  app.addHook('onRequest', (request, reply, done) => {
    RequestContext.create(db.em, done);
  });

  // register auth hook after the ORM one to use the context
  app.addHook('onRequest', async (request) => {
    try {
      const ret = await request.jwtVerify<{ id: number }>();
      request.user = await db.user.findOneOrFail(ret.id);
    } catch (e) {
      app.log.error(e);
      // ignore token errors, we validate the request.user exists only where needed
    }
  });

  // shut down the connection when closing the app
  app.addHook('onClose', async () => {
    await db.orm.close();
  }); // register global error handler to process 404 errors from `findOneOrFail` calls

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AuthError) {
      return reply.status(401).send(error);
    }
    if (error instanceof DisallowedError) {
      return reply.status(403).send(error);
    }

    // we also handle not found errors automatically
    // `NotFoundError` is an error thrown by the ORM via `em.findOneOrFail()` method
    if (error instanceof NotFoundError) {
      return reply.status(404).send(error);
    }

    if (error instanceof DuplicateUserError) {
      return reply.status(409).send(error);
    }

    app.log.error(error);
    reply.status(500).send(error);
  });
});
