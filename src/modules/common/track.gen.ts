import {
  EntityMetadata,
  ReferenceKind,
  type GenerateOptions,
} from '@mikro-orm/core';

const settings: GenerateOptions = {
  onInitialMetadata: (metadata, platform) => {
    for (const meta of metadata) {
      if (
        typeof meta.properties.createdAt !== 'undefined' &&
        typeof meta.properties.updatedAt !== 'undefined'
      ) {
        meta.removeProperty('createdAt', false);
        meta.removeProperty('updatedAt', false);
        meta.addProperty(
          {
            name: '_track',
            kind: ReferenceKind.EMBEDDED,
            optional: true,
            nullable: true,
            type: 'Track',
            runtimeType: 'Track',
            prefix: false,
            object: false,
          },
          false,
        );
        meta.sync();
      }
    }

    const trackClass = new EntityMetadata({
      className: 'Track',
      tableName: 'track',
      embeddable: true,
      relations: [],
    });
    trackClass.addProperty(
      {
        name: 'createdAt',
        fieldNames: ['created_at'],
        columnTypes: ['datetime'],
        type: 'datetime',
        runtimeType: 'Date',
        defaultRaw: 'CURRENT_TIMESTAMP',
      },
      false,
    );
    trackClass.addProperty(
      {
        name: 'updatedAt',
        fieldNames: ['updated_at'],
        columnTypes: ['datetime'],
        type: 'datetime',
        runtimeType: 'Date',
        defaultRaw: 'CURRENT_TIMESTAMP',
      },
      false,
    );
    trackClass.sync();

    metadata.push(trackClass);
  },
};
export default settings;
