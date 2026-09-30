import { ConfigurableModuleBuilder } from '@nestjs/common';

import type { NestGrammyModuleOptions } from '../interfaces/module-options.interface.ts';
import { getOptionsToken } from '../utils/tokens.ts';

export const { ConfigurableModuleClass, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<NestGrammyModuleOptions>({
    optionsInjectionToken: getOptionsToken(),
  })
    .setClassMethodName('forRoot')
    .setFactoryMethodName('createNestGrammyOptions')
    .setExtras({ isGlobal: true }, (definition, extras) => ({
      ...definition,
      global: extras.isGlobal,
    }))
    .build();
