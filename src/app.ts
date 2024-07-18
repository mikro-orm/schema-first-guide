import { fastify } from 'fastify';
import fastifyJWT from '@fastify/jwt';
import { initORM } from './db.js';
import hooks from './modules/common/hooks.js';
import userRoutes from './modules/user/user.routes.js';
import articleRoutes from './modules/article/article.routes.js';

export async function bootstrap(port = 3001, migrate = true) {
  const db = await initORM(
    migrate
      ? { multipleStatements: true, ensureDatabase: { create: false } }
      : {},
  );

  if (migrate) {
    // sync the schema
    await db.orm.migrator.up();
    await db.orm.reconnect({ multipleStatements: false });
  }

  const app = fastify();

  // register JWT plugin
  await app.register(fastifyJWT, {
    secret: process.env.JWT_SECRET ?? '12345678', // fallback for testing
  });

  await app.register(hooks, { db });

  // register routes here
  app.register(articleRoutes, { db, prefix: 'article' });
  app.register(userRoutes, { db, prefix: 'user' });

  const url = await app.listen({ port });

  return { app, url };
}
