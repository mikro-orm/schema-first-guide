import { Migration } from '@mikro-orm/migrations';

export class Migration00000000000002 extends Migration {
  async up(): Promise<void> {
    await this.execute(`
      ALTER TABLE \`users\` 
        ADD UNIQUE INDEX \`email_UNIQUE\` (\`email\` ASC) VISIBLE;
    `);
  }

  async down(): Promise<void> {
    await this.execute(`
      ALTER TABLE \`users\` 
        DROP INDEX \`email_UNIQUE\` ;
    `);
  }
}
