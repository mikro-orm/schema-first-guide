import { hash, verify, needsRehash, type Options } from 'argon2';

const hashOptions: Options = {
  hashLength: 100,
};

export class Password {
  static async fromRaw(raw: string): Promise<Password> {
    return new Password(await hash(raw, hashOptions));
  }

  static fromHash(hash: string): Password {
    return new Password(hash);
  }

  #hash: string;

  private constructor(hash: string) {
    this.#hash = hash;
  }

  verify(raw: string): Promise<boolean> {
    return verify(this.#hash, raw, hashOptions);
  }

  needsRehash(): boolean {
    return needsRehash(this.#hash, hashOptions);
  }

  async verifyAndMaybeRehash(raw: string): Promise<boolean> {
    const verifyResult = await this.verify(raw);
    if (verifyResult && this.needsRehash()) {
      this.#hash = await hash(raw, hashOptions);
    }
    return verifyResult;
  }

  toString() {
    return this.#hash;
  }
}
