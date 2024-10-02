import { Inject, Injectable } from '@nestjs/common';
import * as graphile from 'graphile-worker';
import { Pool } from 'pg';
import { v4 as uuid } from 'uuid';

export interface GraphileRunnerConfig {
  pgPool?: Pool;
  databaseUrl?: string;
  concurrency?: number;
  pollInterval?: number;
}
export const GraphileRunnerConfigType = Symbol.for('GraphileRunnerConfigType');

type JobTypes = {
  process_call: {
    callId: number;
  };
};

type Job<T extends keyof JobTypes = keyof JobTypes> = {
  jobId: T;
  jobKey?: string;
  payload: JobTypes[T];
  handler: (payload: JobTypes[T]) => Promise<void>;
};

type Registry<T extends keyof JobTypes = keyof JobTypes> = {
  [k in T]?: (payload: JobTypes[T]) => Promise<void>;
};

@Injectable()
export class GraphileRunner {
  public runner?: graphile.Runner;
  private readonly registry: Registry = {};

  constructor(
    @Inject(GraphileRunnerConfigType)
    private readonly config: GraphileRunnerConfig,
  ) {}

  async onModuleInit(): Promise<void> {
    this.runner = await graphile.run({
      pgPool: this.config.pgPool,
      connectionString: this.config.databaseUrl,
      concurrency: this.config.concurrency ?? 5,
      noHandleSignals: false,
      pollInterval: this.config.pollInterval ?? 1000,
      taskList: this.registry,
    });

    this.runner.events.on(
      'job:error',
      ({ job, error }: { job: any; error: any }) => {
        console.warn(
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
        console.error(
          {
            payload: job.payload,
            error: error.message,
          },
          `[${job.task_identifier}] Job processing has failed. No more retries.`,
        );
      },
    );
  }

  async addJob(job: Job): Promise<void> {
    this.runner.addJob(job.jobId as string, job.payload, {
      jobKey: job.jobKey ?? uuid(),
    });
    this.registry[job.jobId] = job.handler;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.runner) {
      await this.runner.stop();
    }
  }
}
