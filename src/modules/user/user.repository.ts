import { EntityRepository } from '@mikro-orm/mysql';
import { User } from './user.entity.js';
import { AuthError } from '../common/auth.error.js';
import { Password } from './password.runtimeType.js';

const emptyHash = await Password.fromRaw('');

export class UserRepository extends EntityRepository<User> {
  async exists(email: string) {
    return (await this.count({ email })) > 0;
  }

  async login(email: string, password: string) {
    const err = new AuthError('Invalid combination of email and password');
    if (password === '' || email === '') {
      throw err;
    }

    const user = (await this.findOne(
      { email },
      {
        populate: ['password'], // password is a lazy property, we need to populate it
      },
    )) ?? // This approach minimizes the effectiveness of timing attacks // On failure, we return a pseudo user with an empty password hash.
    { password: emptyHash, id: 0, token: undefined };

    if (await user.password.verifyAndMaybeRehash(password)) {
      await this.getEntityManager().flush();
      return user; //password is a hidden property, so it won't be returned, even on success.
    }

    throw err;
  }
}
