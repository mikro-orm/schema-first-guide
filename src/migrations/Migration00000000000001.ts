import { Migration } from '@mikro-orm/migrations';

export class Migration00000000000001 extends Migration {
  async up(): Promise<void> {
    await this.execute(`
RENAME TABLE
    \`article\` TO \`articles\`,
    \`article_tag\` TO \`article_tags\`,
    \`tag\` TO \`tags\`,
    \`comment\` TO \`comments\`,
    \`user\` TO \`users\`
    `);
  }
  async down(): Promise<void> {
    await this.execute(`
RENAME TABLE
    \`articles\` TO \`article\`,
    \`article_tags\` TO \`article_tag\`,
    \`tags\` TO \`tag\`,
    \`comments\` TO \`comment\`,
    \`users\` TO \`user\`
    `);
  }
}
