import type { Router } from "express";

import type { OpenClawChatAgentClient } from "../infra/openclaw-chat-agent-client";
import {
  createChatRouter,
  type ChatRouterDependencies
} from "./chat";

export {
  appendAttachmentHintsToMessage,
  isChatAgentMessageInputItem,
  readChatAgentAttachments,
  readChatAgentItemText,
  readChatAgentMessage,
  readChatAgentRequestBody
} from "./chat";

/**
 * Builds the dedicated chat agent router.
 *
 * @param dependencyOrClient Optional chat router dependencies or chat agent client.
 * @returns The router exposing the chat flow endpoint.
 */
export function createChatAgentRouter(
  dependencyOrClient?: ChatRouterDependencies | OpenClawChatAgentClient
): Router {
  if (
    dependencyOrClient !== undefined
    && "createResponseStream" in dependencyOrClient
  ) {
    return createChatRouter({
      chatAgentClient: dependencyOrClient
    });
  }

  return createChatRouter(dependencyOrClient);
}
