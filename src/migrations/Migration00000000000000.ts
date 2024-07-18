import { Migration } from '@mikro-orm/migrations';

export class Migration00000000000000 extends Migration {
  async up(): Promise<void> {
    await this.execute(`
CREATE TABLE IF NOT EXISTS \`user\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`full_name\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(255) NOT NULL,
  \`password\` VARCHAR(255) NOT NULL,
  \`bio\` TEXT NOT NULL,
  PRIMARY KEY (\`id\`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS \`article\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`slug\` VARCHAR(255) NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`description\` VARCHAR(1000) NOT NULL,
  \`text\` TEXT NOT NULL,
  \`author\` INT UNSIGNED NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE INDEX \`slug_UNIQUE\` (\`slug\` ASC) VISIBLE,
  INDEX \`fk_article_user1_idx\` (\`author\` ASC) VISIBLE,
  CONSTRAINT \`fk_article_user1\`
    FOREIGN KEY (\`author\`)
    REFERENCES \`user\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS \`comment\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`text\` VARCHAR(1000) NOT NULL,
  \`article\` INT UNSIGNED NOT NULL,
  \`author\` INT UNSIGNED NOT NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`fk_comment_article1_idx\` (\`article\` ASC) VISIBLE,
  INDEX \`fk_comment_user1_idx\` (\`author\` ASC) VISIBLE,
  CONSTRAINT \`fk_comment_article1\`
    FOREIGN KEY (\`article\`)
    REFERENCES \`article\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT \`fk_comment_user1\`
    FOREIGN KEY (\`author\`)
    REFERENCES \`user\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS \`tag\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`name\` VARCHAR(20) NOT NULL,
  PRIMARY KEY (\`id\`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS \`article_tag\` (
  \`article_id\` INT UNSIGNED NOT NULL,
  \`tag_id\` INT UNSIGNED NOT NULL,
  PRIMARY KEY (\`article_id\`, \`tag_id\`),
  INDEX \`fk_article_tag_tag1_idx\` (\`tag_id\` ASC) VISIBLE,
  CONSTRAINT \`fk_article_tag_article1\`
    FOREIGN KEY (\`article_id\`)
    REFERENCES \`article\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT \`fk_article_tag_tag1\`
    FOREIGN KEY (\`tag_id\`)
    REFERENCES \`tag\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;
`);
  }
}
