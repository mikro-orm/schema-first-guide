import type { GenerateOptions } from '@mikro-orm/core';
import { Utils } from '@mikro-orm/core';

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
      const articleColumn = commentEntity.properties.article.fieldNames[0];
      const idColumn = commentEntity.properties.id.fieldNames[0];
      const formulaSql = `(select count(*) from \`${commentEntity.tableName}\` where \`${articleColumn}\` = ??.\`${idColumn}\`)`;
      const formula = Utils.createFunction(
        new Map(),
        `return (alias) => ${JSON.stringify(formulaSql)}.replaceAll('??', alias)`,
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
