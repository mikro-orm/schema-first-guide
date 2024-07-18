import type { GenerateOptions } from '@mikro-orm/core';
import { type SqlEntityManager, Utils } from '@mikro-orm/mysql';

const settings: GenerateOptions = {
  fileName: (entityName) => {
    switch (entityName) {
      case '_Article':
        return `article/article.entity`;
      case 'Article':
        return `article/article.customEntity`;
      case 'ArticleTag':
      case 'Tag':
      case 'Comment':
        return `article/${entityName.toLowerCase()}.entity`;
    }
    return '';
  },
  onInitialMetadata: (metadata, platform) => {
    const articleEntity = metadata.find((meta) => meta.className === 'Article');
    if (articleEntity) {
      const textProp = articleEntity.properties.text;
      textProp.lazy = true;

      const commentEntity = metadata.find(
        (meta) => meta.className === 'Comment',
      );
      if (!commentEntity) {
        return;
      }
      const em = platform
        .getConfig()
        .getDriver()
        .createEntityManager() as SqlEntityManager;
      const qb = em
        .getKnex()
        .queryBuilder()
        .count()
        .from(commentEntity.tableName)
        .where(
          commentEntity.properties.article.fieldNames[0],
          '=',
          em
            .getKnex()
            .raw('??.??', [
              em.getKnex().raw('??'),
              commentEntity.properties.id.fieldNames[0],
            ]),
        );
      const formula = Utils.createFunction(
        new Map(),
        `return (alias) => ${JSON.stringify(`(${qb.toSQL().sql})`)}.replaceAll('??', alias)`,
      );

      articleEntity.addProperty({
        name: 'commentsCount',
        fieldNames: ['comments_count'],
        columnTypes: ['INT'],
        unsigned: true,
        optional: true,
        type: 'integer',
        runtimeType: 'number',
        default: 0,
        lazy: true,
        formula,
      });
    }
  },
  onProcessedMetadata: (metadata, platform) => {
    const articleEntity = metadata.find((meta) => meta.className === 'Article');
    if (articleEntity) {
      articleEntity.className = '_Article';
      articleEntity.abstract = true;
    }
  },
};
export default settings;
