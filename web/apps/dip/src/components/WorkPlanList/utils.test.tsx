import { describe, expect, it, vi } from 'vitest'

vi.mock('react-intl-universal', () => ({
  default: {
    get: (key: string) => key,
  },
}))

import type { CronJob } from '@/apis/dip-studio/plan'
import { planExecutionConditionText } from './utils'

function createJob(overrides: Partial<CronJob> = {}): CronJob {
  return {
    id: 'job-1',
    agentId: 'agent-1',
    sessionKey: 'session-1',
    name: 'job',
    enabled: true,
    createdAtMs: 0,
    updatedAtMs: 0,
    schedule: {},
    ...overrides,
  }
}

describe('planExecutionConditionText', () => {
  it('uses schedule.kind=at for execution condition text', () => {
    expect(planExecutionConditionText(createJob({ schedule: { kind: 'at' } }))).toBe(
      'workPlan.list.executionConditionAt',
    )
  })

  it('uses schedule.kind=every for execution condition text', () => {
    expect(planExecutionConditionText(createJob({ schedule: { kind: 'every' } }))).toBe(
      'workPlan.list.executionConditionEvery',
    )
  })

  it('falls back when schedule.kind is unsupported', () => {
    expect(
      planExecutionConditionText(
        createJob({
          schedule: { kind: 'cron' },
          wakeMode: '手动触发',
        }),
      ),
    ).toBe('手动触发')
  })
})
