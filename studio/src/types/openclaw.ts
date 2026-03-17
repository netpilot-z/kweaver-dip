/**
 * Supported OpenClaw agent list scopes.
 */
export type OpenClawAgentScope = "global" | "per-sender";

/**
 * Describes the optional identity metadata of an OpenClaw agent.
 */
export interface OpenClawAgentIdentity {
  /**
   * Human-readable display name.
   */
  name?: string;

  /**
   * Optional theme key used by OpenClaw UIs.
   */
  theme?: string;

  /**
   * Optional emoji marker for the agent.
   */
  emoji?: string;

  /**
   * Optional local avatar path.
   */
  avatar?: string;

  /**
   * Optional remote avatar URL.
   */
  avatarUrl?: string;
}

/**
 * Describes an OpenClaw agent summary entry.
 */
export interface OpenClawAgentSummary {
  /**
   * Stable OpenClaw agent identifier.
   */
  id: string;

  /**
   * Optional display name.
   */
  name?: string;

  /**
   * Optional identity block.
   */
  identity?: OpenClawAgentIdentity;
}

/**
 * Matches the `AgentsListResult` schema from OpenClaw.
 */
export interface OpenClawAgentsListResult {
  /**
   * Default OpenClaw agent id.
   */
  defaultId: string;

  /**
   * Primary routing key used by OpenClaw.
   */
  mainKey: string;

  /**
   * Scope of agent routing.
   */
  scope: OpenClawAgentScope;

  /**
   * Available agent summaries.
   */
  agents: OpenClawAgentSummary[];
}

/**
 * Represents a request frame sent to the OpenClaw gateway.
 */
export interface OpenClawRequestFrame {
  /**
   * Frame type discriminator.
   */
  type: "req";

  /**
   * Correlation identifier.
   */
  id: string;

  /**
   * Gateway method name.
   */
  method: string;

  /**
   * Method parameters.
   */
  params?: unknown;
}

/**
 * Represents a response frame received from the OpenClaw gateway.
 */
export interface OpenClawResponseFrame {
  /**
   * Frame type discriminator.
   */
  type: "res";

  /**
   * Correlation identifier.
   */
  id: string;

  /**
   * Indicates whether the request succeeded.
   */
  ok: boolean;

  /**
   * Successful payload.
   */
  payload?: unknown;

  /**
   * Error payload.
   */
  error?: {
    /**
     * Stable gateway error code.
     */
    code: string;

    /**
     * Human-readable message.
     */
    message: string;
  };
}

/**
 * Represents an event frame received from the OpenClaw gateway.
 */
export interface OpenClawEventFrame {
  /**
   * Frame type discriminator.
   */
  type: "event";

  /**
   * Event name.
   */
  event: string;

  /**
   * Event payload.
   */
  payload?: unknown;
}

/**
 * Union of supported OpenClaw gateway frames.
 */
export type OpenClawGatewayFrame =
  | OpenClawRequestFrame
  | OpenClawResponseFrame
  | OpenClawEventFrame;
