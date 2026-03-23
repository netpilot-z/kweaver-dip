import type { OpenClawCronAdapter } from "../adapters/openclaw-cron-adapter";
import type {
  OpenClawCronListParams,
  OpenClawCronJob,
  OpenClawCronListResult,
  OpenClawCronRunsParams,
  OpenClawCronRunsResult
} from "../types/plan";
import { parseSession } from "../utils/session";

/**
 * Application logic used to fetch cron jobs and run history.
 */
export interface CronLogic {
  /**
   * Fetches cron jobs with the requested filters.
   *
   * @param params Query parameters forwarded to OpenClaw.
   * @returns The cron jobs list payload.
   */
  listCronJobs(params: OpenClawCronListParams): Promise<OpenClawCronListResult>;

  /**
   * Fetches cron run history with the requested filters.
   *
   * @param params Query parameters forwarded to OpenClaw.
   * @returns The cron runs payload.
   */
  listCronRuns(params: OpenClawCronRunsParams): Promise<OpenClawCronRunsResult>;
}

/**
 * Logic implementation backed by OpenClaw cron APIs.
 */
export class DefaultCronLogic implements CronLogic {
  /**
   * Creates the cron logic.
   *
   * @param openClawCronAdapter The adapter used to fetch OpenClaw cron data.
   */
  public constructor(private readonly openClawCronAdapter: OpenClawCronAdapter) {}

  /**
   * Fetches cron jobs from OpenClaw.
   *
   * @param params Query parameters forwarded to OpenClaw.
   * @returns The cron jobs list payload.
   */
  public async listCronJobs(
    params: OpenClawCronListParams
  ): Promise<OpenClawCronListResult> {
    const { userId, ...adapterParams } = params;
    const result = await this.openClawCronAdapter.listCronJobs(adapterParams);

    if (userId === undefined) {
      return result;
    }

    const jobs = result.jobs.filter((job) => hasMatchingSessionUserId(job, userId));

    return buildFilteredCronListResult(jobs);
  }

  /**
   * Fetches cron runs from OpenClaw.
   *
   * @param params Query parameters forwarded to OpenClaw.
   * @returns The cron runs payload.
   */
  public async listCronRuns(
    params: OpenClawCronRunsParams
  ): Promise<OpenClawCronRunsResult> {
    return this.openClawCronAdapter.listCronRuns(params);
  }
}

/**
 * Returns whether the job session belongs to the requested user.
 *
 * @param job The cron job to inspect.
 * @param userId The authenticated user identifier.
 * @returns True when the session user id matches.
 */
function hasMatchingSessionUserId(job: OpenClawCronJob, userId: string): boolean {
  try {
    return parseSession(job.sessionKey).userId === userId;
  } catch {
    return false;
  }
}

/**
 * Rebuilds a cron list response after Studio-side filtering.
 *
 * @param jobs The filtered jobs.
 * @returns A normalized list result containing only the filtered jobs.
 */
function buildFilteredCronListResult(jobs: OpenClawCronJob[]): OpenClawCronListResult {
  return {
    jobs,
    total: jobs.length,
    offset: 0,
    limit: jobs.length,
    hasMore: false,
    nextOffset: null
  };
}
