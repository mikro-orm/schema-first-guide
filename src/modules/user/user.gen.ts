import { ReferenceKind, type GenerateOptions } from '@mikro-orm/core';

const settings: GenerateOptions = {
  fileName: (entityName) => {
    switch (entityName) {
      case 'UserRepository':
        return `user/user.repository`;
      case 'User':
        return `user/${entityName.toLowerCase()}.entity`;
      case 'Password':
        return `user/password.runtimeType`;
      case 'PasswordType':
        return `user/password.type`;
      case 'Social':
        return `user/social.customEntity`;
    }
    return '';
  },
  onInitialMetadata: (metadata, platform) => {
    const userEntity = metadata.find((meta) => meta.className === 'User');
    if (userEntity) {
      userEntity.repositoryClass = 'UserRepository';
      userEntity.addProperty({
        persist: false,
        name: 'token',
        nullable: true,
        default: null,
        defaultRaw: 'null',
        fieldNames: [
          platform
            .getConfig()
            .getNamingStrategy()
            .propertyToColumnName('token'),
        ],
        columnTypes: ['varchar(255)'],
        type: 'string',
        runtimeType: 'string',
      });
      const passwordProp = userEntity.properties.password;
      passwordProp.hidden = true;
      passwordProp.lazy = true;
      passwordProp.type = 'PasswordType';
      passwordProp.runtimeType = 'Password';

      const socialProp = userEntity.properties.social;
      socialProp.kind = ReferenceKind.EMBEDDED;
      socialProp.type = 'Social';
      socialProp.object = true;
      socialProp.prefix = false;
    }
  },
};
export default settings;
