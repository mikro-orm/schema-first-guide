import { type FastifyRequest } from 'fastify';
import { type User } from '../user/user.entity.js';
import { AuthError } from './auth.error.js';

export function getUserFromToken(req: FastifyRequest): User {
  if (!req.user) {
    throw new AuthError('Please provide your token via Authorization header');
  }

  return req.user as User;
}
