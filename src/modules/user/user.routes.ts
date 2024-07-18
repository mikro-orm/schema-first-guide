import { type FastifyPluginAsync } from 'fastify';
import { type Services } from '../../db.js';
import { Password } from './password.runtimeType.js';
import { UniqueConstraintViolationException, wrap } from '@mikro-orm/mysql';
import { z } from 'zod';
import { DuplicateUserError } from './duplicate.error.js';
import { getUserFromToken } from '../common/utils.js';

export default (async (app, { db }) => {
  const signUpPayload = z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(1)
      .transform(async (raw) => Password.fromRaw(raw)),
    fullName: z.string().min(1),
    bio: z.string().optional().default(''),
    social: z
      .object({
        twitter: z.string().min(1).optional(),
        facebook: z.string().min(1).optional(),
        linkedin: z.string().min(1).optional(),
      })
      .optional(),
  });

  // register new user
  app.post('/sign-up', async (request) => {
    const body = await signUpPayload.parseAsync(request.body);

    if (await db.user.exists(body.email)) {
      throw new DuplicateUserError(
        'This email is already registered, maybe you want to sign in?',
      );
    }

    const user = db.user.create(body);
    try {
      await db.em.persist(user).flush();

      // after flush, we have the `user.id` set
      console.log(`User ${user.id} created`);

      user.token = app.jwt.sign({ id: user.id });

      return user;
    } catch (e: unknown) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new DuplicateUserError(
          'This email is already registered, maybe you want to sign in?',
          { cause: e },
        );
      }
      throw e;
    }
  });

  const signInPayload = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  app.post('/sign-in', async (request) => {
    const { email, password } = signInPayload.parse(request.body);
    const user = await db.user.login(email, password);
    user.token = app.jwt.sign({ id: user.id });
    return user;
  });

  app.get('/profile', async (request) => {
    return getUserFromToken(request);
  });

  const profileUpdatePayload = signUpPayload.partial();

  app.patch('/profile', async (request) => {
    const user = getUserFromToken(request);
    wrap(user).assign(profileUpdatePayload.parse(request.body));
    await db.em.flush();
    return user;
  });
}) as FastifyPluginAsync<{ db: Services }>;
