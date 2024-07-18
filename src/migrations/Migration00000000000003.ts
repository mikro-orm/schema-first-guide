import { Migration } from '@mikro-orm/migrations';

export class Migration00000000000003 extends Migration {
  async up(): Promise<void> {
    await this.execute(`
      ALTER TABLE \`users\`
        ADD COLUMN \`social\` JSON NULL DEFAULT NULL AFTER \`bio\`;
    `);
  }

  async down(): Promise<void> {
    await this.execute(`
      ALTER TABLE \`users\`
        DROP COLUMN \`social\`;
    `);
  }
}
