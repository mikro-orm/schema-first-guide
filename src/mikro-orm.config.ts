import { defineConfig, type MikroORMOptions } from '@mikro-orm/mysql';
import {
  UnderscoreNamingStrategy,
  type GenerateOptions,
} from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import pluralize from 'pluralize';
import { join, dirname } from 'node:path';
import { sync } from 'globby';
import { fileURLToPath } from 'node:url';

const isInMikroOrmCli =
  process.argv[1]?.endsWith(join('@mikro-orm', 'cli', 'esm')) ?? false;
const isRunningGenerateEntities =
  isInMikroOrmCli && process.argv[2] === 'generate-entities';

const mikroOrmExtensions: MikroORMOptions['extensions'] = [Migrator];

const fileNameFunctions: NonNullable<GenerateOptions['fileName']>[] = [];
const onInitialMetadataFunctions: NonNullable<
  GenerateOptions['onInitialMetadata']
>[] = [];
const onProcessedMetadataFunctions: NonNullable<
  GenerateOptions['onProcessedMetadata']
>[] = [];

if (isInMikroOrmCli) {
  mikroOrmExtensions.push(
    (await import('@mikro-orm/entity-generator')).EntityGenerator,
  );
  if (isRunningGenerateEntities) {
    const fileDir = dirname(fileURLToPath(import.meta.url));
    const genExtensionFiles = sync('./modules/**/*.gen.ts', { cwd: fileDir });
    for (const file of genExtensionFiles) {
      const genExtension = (await import(file)).default as GenerateOptions;
      if (genExtension.fileName) {
        fileNameFunctions.push(genExtension.fileName);
      }
      if (genExtension.onInitialMetadata) {
        onInitialMetadataFunctions.push(genExtension.onInitialMetadata);
      }
      if (genExtension.onProcessedMetadata) {
        onProcessedMetadataFunctions.push(genExtension.onProcessedMetadata);
      }
    }
  }
}

export default defineConfig({
  extensions: mikroOrmExtensions,
  multipleStatements: isInMikroOrmCli,
  discovery: {
    warnWhenNoEntities: !isInMikroOrmCli,
  },
  host: 'localhost',
  user: 'root',
  password: '',
  dbName: 'blog',
  entities: isRunningGenerateEntities
    ? []
    : ['dist/**/*.customEntity.js', 'dist/**/*.entity.js'],
  entitiesTs: isRunningGenerateEntities
    ? []
    : ['src/**/*.customEntity.ts', 'src/**/*.entity.ts'],
  // enable debug mode to log SQL queries and discovery information
  debug: true,
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
  },
  namingStrategy: class extends UnderscoreNamingStrategy {
    override getEntityName(tableName: string, schemaName?: string): string {
      return pluralize.singular(super.getEntityName(tableName, schemaName));
    }
  },
  entityGenerator: {
    scalarTypeInDecorator: true,
    fileName: (entityName) => {
      for (const f of fileNameFunctions) {
        const r = f(entityName);
        if (r === '') {
          continue;
        }
        return r;
      }
      return `common/${entityName.toLowerCase()}.entity`;
    },
    onInitialMetadata: (metadata, platform) => {
      return Promise.all(
        onInitialMetadataFunctions.map((f) => f(metadata, platform)),
      ).then();
    },
    onProcessedMetadata: (metadata, platform) => {
      return Promise.all(
        onProcessedMetadataFunctions.map((f) => f(metadata, platform)),
      ).then();
    },
    save: true,
    path: 'src/modules',
    esmImport: true,
    outputPurePivotTables: true,
    readOnlyPivotTables: true,
    bidirectionalRelations: true,
    customBaseEntityName: 'Base',
    useCoreBaseEntity: true,
  },
});
