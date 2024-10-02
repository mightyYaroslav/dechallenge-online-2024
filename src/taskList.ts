import { Injectable } from '@nestjs/common';
import { makeWorkerUtils } from 'graphile-worker';
import { v4 as uuid } from 'uuid';

type JobTypes = {
  process_call: {
    callId: number;
  };
};

type Job<T extends keyof JobTypes = keyof JobTypes> = {
  jobId: T;
  jobKey: string;
  payload: JobTypes[T];
  handler: (payload: JobTypes[T]) => Promise<void>;
};

@Injectable()
export class TaskList {
  private readonly registry: Job[];

  async addJob<T extends keyof JobTypes = keyof JobTypes>(
    jobId: T,
    payload: JobTypes[T],
    handler: (payload: JobTypes[T]) => Promise<void>,
  ): Promise<void> {
    const workerUtils = await makeWorkerUtils({
      connectionString: process.env.DATABASE_URL,
    });
    const jobKey = uuid();
    await workerUtils.addJob(jobId as string, payload, {
      jobKey,
    });
    this.registry.push({ jobId, jobKey, payload, handler });
  }

  getJobs(): Job[] {
    return this.registry;
  }
}
