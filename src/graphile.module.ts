import { DynamicModule, Module } from '@nestjs/common';

import {
  GraphileRunner,
  GraphileRunnerConfig,
  GraphileRunnerConfigType,
} from './runner';

@Module({})
export class GraphileModule {
  static register(options: GraphileRunnerConfig): DynamicModule {
    return {
      module: GraphileModule,
      providers: [
        { provide: GraphileRunnerConfigType, useValue: options },
        GraphileRunner,
      ],
      exports: [GraphileRunner],
    };
  }
}
