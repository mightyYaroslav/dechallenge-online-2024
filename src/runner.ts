import { LogFunctionFactory } from '@graphile/logger';
import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import * as graphile from 'graphile-worker';
import { Job } from 'graphile-worker';
import { Pool } from 'pg';

import { createAsyncStateContext } from '../asyncState';
import logger from '../logger';
import { setTraceId } from '../logTracing';
import { ASYNC_JOBS_QUEUE, AsyncJobPayload, WorkersRegistry } from './index';
import { TaskList } from './taskList';

export interface GraphileRunnerConfig {
  pgPool?: Pool;
  databaseUrl?: string;
  concurrency?: number;
  pollInterval?: number;
}
export const GraphileRunnerConfigType = Symbol.for('GraphileRunnerConfigType');

@Injectable()
export class GraphileRunner {
  public runner?: graphile.Runner;
  constructor(
    @Inject(GraphileRunnerConfigType)
    private readonly config: GraphileRunnerConfig,
    private readonly taskList: TaskList,

    private readonly moduleReference: ModuleRef,
  ) {}

  async onModuleInit(): Promise<void> {
    const tasks = this.taskList.getJobs();
    this.runner = await graphile.run({
      pgPool: this.config.pgPool,
      connectionString: this.config.databaseUrl,
      concurrency: this.config.concurrency ?? 5,
      noHandleSignals: false,
      pollInterval: this.config.pollInterval ?? 1000,
      taskList: tasks.reduce(
        (acc, t) => ({ ...acc, [t.jobKey]: t.handler }),
        {},
      ),
    });

    this.runner.events.on(
      'job:error',
      ({ job, error }: { job: any; error: any }) => {
        logger.warn(
          {
            payload: job.payload,
            jobKey: job.key,
            jobId: job.id,
            taskIdentifier: job.task_identifier,
            attempts: job.attempts,
            maxAttempts: job.max_attempts,
            error: error.message,
            stack: error.stack,
          },
          `[${job.task_identifier}] Job processing end up with error. Retrying...`,
        );
      },
    );

    this.runner.events.on(
      'job:failed',
      ({ job, error }: { job: any; error: any }) => {
        logger.error(
          {
            payload: job.payload,
            error: error.message,
          },
          `[${job.task_identifier}] Job processing has failed. No more retries.`,
        );
      },
    );
  }

  async onModuleDestroy(): Promise<void> {
    if (this.runner) {
      await this.runner.stop();
    }
  }
}
