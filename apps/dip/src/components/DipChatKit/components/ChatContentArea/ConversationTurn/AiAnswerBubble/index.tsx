import { CheckOutlined, CopyOutlined, RedoOutlined } from '@ant-design/icons'
import { Bubble, CodeHighlighter, Mermaid } from '@ant-design/x'
import XMarkdown, { type ComponentProps as MarkdownComponentProps } from '@ant-design/x-markdown'
import '@ant-design/x-markdown/dist/x-markdown.css'
import clsx from 'clsx'
import isEmpty from 'lodash/isEmpty'
import type React from 'react'
import { Children, useMemo } from 'react'
import intl from 'react-intl-universal'
import IconFont from '@/components/IconFont'
import MessageActions from '../MessageActions'
import type { MessageAction } from '../MessageActions/types'
import ArtifactMessageCard from './ArtifactMessageCard'
import styles from './index.module.less'
import type { AiAnswerBubbleProps, DipChatKitToolCardItem } from './types'
import {
  buildArchiveGridPreviewPayload,
  buildCardPreviewPayload,
  buildCodePreviewPayload,
  buildMarkdownFilePreviewPayload,
  buildToolCardItems,
  extractMarkdownFileNameFromHref,
  getDomDataAttributes,
  isMermaidLanguage,
  isToolRoleEvent,
  normalizeLanguage,
  normalizeMarkdownText,
  splitTextByMarkdownFileName,
} from './utils'

const AiAnswerBubble: React.FC<AiAnswerBubbleProps> = ({
  turn,
  onCopy,
  onRegenerate,
  onOpenPreview,
}) => {
  const toolCards = useMemo(() => {
    return buildToolCardItems(turn.answerEvents)
  }, [turn.answerEvents])

  const hasToolRoleEvents = useMemo(() => {
    return turn.answerEvents.some(isToolRoleEvent)
  }, [turn.answerEvents])

  const markdownComponents = useMemo(() => {
    const openMarkdownFilePreview = (fileName: string, sourceContent?: string) => {
      onOpenPreview(buildMarkdownFilePreviewPayload(fileName, sourceContent))
    }

    const renderTextWithMarkdownFilePreview = (
      text: string,
      keyPrefix: string,
    ): React.ReactNode[] => {
      const segments = splitTextByMarkdownFileName(text)
      if (segments.length === 0) {
        return [text]
      }

      return segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <span key={`${keyPrefix}-text-${index}`}>{segment.value}</span>
        }

        return (
          <span
            key={`${keyPrefix}-file-${index}`}
            className={styles.markdownFileLink}
            role="button"
            tabIndex={0}
            onClick={() => {
              openMarkdownFilePreview(segment.value, segment.value)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                openMarkdownFilePreview(segment.value, segment.value)
              }
            }}
          >
            {segment.value}
          </span>
        )
      })
    }

    const renderChildrenWithMarkdownFilePreview = (
      children: React.ReactNode,
      keyPrefix: string,
    ): React.ReactNode[] => {
      const nodes = Children.toArray(children)
      return nodes.reduce<React.ReactNode[]>((result, node, index) => {
        if (typeof node === 'string') {
          const textNodes = renderTextWithMarkdownFilePreview(node, `${keyPrefix}-${index}`)
          result.push(...textNodes)
          return result
        }

        result.push(node)
        return result
      }, [])
    }

    const CodeRenderer: React.FC<MarkdownComponentProps> = ({
      children,
      lang,
      block,
      className,
    }) => {
      const language = normalizeLanguage(lang)
      const codeText = normalizeMarkdownText(children)

      if (!block) {
        return <code className={clsx(styles.inlineCode, className)}>{codeText}</code>
      }

      if (isMermaidLanguage(language)) {
        return (
          <div
            className={styles.blockCodeWrap}
            onClick={() => {
              onOpenPreview(buildCodePreviewPayload(language, codeText))
            }}
            role="presentation"
          >
            <Mermaid>{codeText}</Mermaid>
          </div>
        )
      }

      const artifactPreviewPayload = buildArchiveGridPreviewPayload(turn.sessionKey, codeText)
      if (artifactPreviewPayload?.artifact) {
        return (
          <div className={styles.blockCodeWrap}>
            <ArtifactMessageCard
              fileName={artifactPreviewPayload.artifact.fileName}
              archiveRoot={artifactPreviewPayload.artifact.archiveRoot || ''}
              onClick={() => {
                onOpenPreview(artifactPreviewPayload)
              }}
            />
          </div>
        )
      }

      return (
        <div
          className={styles.blockCodeWrap}
          onClick={() => {
            onOpenPreview(buildCodePreviewPayload(language, codeText))
          }}
          role="presentation"
        >
          <CodeHighlighter lang={language || 'text'}>{codeText}</CodeHighlighter>
        </div>
      )
    }

    const LinkRenderer: React.FC<MarkdownComponentProps> = ({ children, className, href }) => {
      const hrefText = normalizeMarkdownText(href)
      const fileName = extractMarkdownFileNameFromHref(hrefText)

      if (!fileName) {
        return (
          <a className={className} href={hrefText || undefined} target="_blank" rel="noreferrer">
            {children}
          </a>
        )
      }

      const displayText = normalizeMarkdownText(children) || fileName
      return (
        <span
          className={clsx(className, styles.markdownFileLink)}
          role="button"
          tabIndex={0}
          onClick={() => {
            openMarkdownFilePreview(fileName, hrefText || displayText)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openMarkdownFilePreview(fileName, hrefText || displayText)
            }
          }}
        >
          {displayText}
        </span>
      )
    }

    const ParagraphRenderer: React.FC<MarkdownComponentProps> = ({ children, className }) => {
      return <p className={className}>{renderChildrenWithMarkdownFilePreview(children, 'p')}</p>
    }

    const ListItemRenderer: React.FC<MarkdownComponentProps> = ({ children, className }) => {
      return <li className={className}>{renderChildrenWithMarkdownFilePreview(children, 'li')}</li>
    }

    const DivRenderer: React.FC<MarkdownComponentProps> = ({ children, className, domNode }) => {
      const attrs = getDomDataAttributes(domNode)
      const isPreviewCard = attrs['data-preview-card'] === 'true'
      if (!isPreviewCard) {
        return <div className={className}>{children}</div>
      }

      const title =
        attrs['data-preview-title'] ||
        (intl.get('dipChatKit.answerCard').d('Answer card') as string)
      const content = attrs['data-preview-content'] || normalizeMarkdownText(children)

      return (
        <div
          className={styles.previewCard}
          onClick={() => {
            onOpenPreview(buildCardPreviewPayload(title, content))
          }}
          role="presentation"
        >
          <span className={styles.previewCardTitle}>{title}</span>
          <span className={styles.previewCardDesc}>{content}</span>
        </div>
      )
    }

    return {
      code: CodeRenderer,
      a: LinkRenderer,
      p: ParagraphRenderer,
      li: ListItemRenderer,
      div: DivRenderer,
    }
  }, [onOpenPreview, turn.sessionKey])

  const toolCardMarkdownComponents = useMemo(() => {
    const ToolCardCodeRenderer: React.FC<MarkdownComponentProps> = ({
      children,
      lang,
      block,
      className,
    }) => {
      const language = normalizeLanguage(lang)
      const codeText = normalizeMarkdownText(children)

      if (!block) {
        return <code className={clsx(styles.inlineCode, className)}>{codeText}</code>
      }

      if (isMermaidLanguage(language)) {
        return <Mermaid>{codeText}</Mermaid>
      }

      return <CodeHighlighter lang={language || 'text'}>{codeText}</CodeHighlighter>
    }

    const ToolCardLinkRenderer: React.FC<MarkdownComponentProps> = ({
      children,
      className,
      href,
    }) => {
      const hrefText = normalizeMarkdownText(href)
      return (
        <a className={className} href={hrefText || undefined} target="_blank" rel="noreferrer">
          {children}
        </a>
      )
    }

    return {
      code: ToolCardCodeRenderer,
      a: ToolCardLinkRenderer,
    }
  }, [])

  const answerContent =
    turn.answerMarkdown ||
    (turn.answerLoading ? intl.get('dipChatKit.answerLoading').d('Processing...') : '')
  const hasToolCards = toolCards.length > 0
  const shouldRenderAnswerBubble =
    Boolean(answerContent) || turn.answerLoading || turn.answerStreaming || hasToolCards

  const bubbleActions = useMemo<MessageAction[]>(() => {
    const actions: MessageAction[] = []
    if (hasToolCards) {
      return actions
    }

    if (turn.answerMarkdown.trim()) {
      actions.push({
        key: 'copy-answer',
        title: intl.get('dipChatKit.copyAnswer').d('Copy answer') as string,
        icon: <CopyOutlined />,
        onClick: onCopy,
      })
    }

    if (turn.question.trim()) {
      actions.push({
        key: 'regenerate-answer',
        title: intl.get('dipChatKit.regenerateAnswer').d('Regenerate') as string,
        icon: <RedoOutlined />,
        onClick: onRegenerate,
      })
    }

    return actions
  }, [hasToolCards, onCopy, onRegenerate, turn.answerMarkdown, turn.question])

  const resolveToolIconType = (toolName: string): string => {
    const normalizedToolName = toolName.trim().toLowerCase()
    if (
      normalizedToolName === 'read' ||
      normalizedToolName.includes('read') ||
      normalizedToolName.includes('doc') ||
      normalizedToolName.includes('file')
    ) {
      return 'icon-plan'
    }
    return 'icon-tool'
  }

  const renderToolCard = (toolCard: DipChatKitToolCardItem) => {
    const hasText = Boolean(toolCard.text.trim())
    const showPreview = Boolean(toolCard.previewText)
    const showInline = Boolean(toolCard.inlineText)
    const shouldRenderResultMarkdown = toolCard.kind === 'result' && hasText
    const statusText = toolCard.isError
      ? (intl.get('dipChatKit.eventActionError').d('Error') as string)
      : toolCard.status === 'in_progress'
        ? (intl.get('dipChatKit.toolInProgress').d('In progress') as string)
        : toolCard.kind === 'result' || toolCard.status === 'completed'
          ? (intl.get('dipChatKit.toolCompleted').d('Completed') as string)
          : (intl.get('dipChatKit.toolCompleted').d('Completed') as string)

    return (
      <div
        key={toolCard.id}
        className={clsx(
          'chatToolCard',
          styles.chatToolCard,
          toolCard.isError && styles.chatToolCardError,
        )}
      >
        <div className={styles.chatToolCardHeader}>
          <div className={styles.chatToolCardTitle}>
            <span className={styles.chatToolCardIcon}>
              <IconFont type={resolveToolIconType(toolCard.toolName || toolCard.title)} />
            </span>
            <span>{toolCard.title}</span>
          </div>
          {!hasText && (
            <span className={styles.chatToolCardStatus}>
              <CheckOutlined />
            </span>
          )}
        </div>
        {toolCard.detail && <div className={styles.chatToolCardDetail}>{toolCard.detail}</div>}
        {!hasText && <div className={styles.chatToolCardStatusText}>{statusText}</div>}
        {showPreview && (
          <div className={styles.chatToolCardPreview}>
            {shouldRenderResultMarkdown ? (
              <XMarkdown
                className={styles.toolCardMarkdown}
                components={toolCardMarkdownComponents}
              >
                {toolCard.text}
              </XMarkdown>
            ) : (
              <pre>{toolCard.previewText}</pre>
            )}
          </div>
        )}
        {showInline && (
          <div className={styles.chatToolCardInline}>
            {shouldRenderResultMarkdown ? (
              <XMarkdown
                className={styles.toolCardMarkdown}
                components={toolCardMarkdownComponents}
              >
                {toolCard.text}
              </XMarkdown>
            ) : (
              <span>{toolCard.inlineText}</span>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderToolCards = (isToolOnly = false) => {
    if (!hasToolCards) {
      return null
    }

    return (
      <div className={clsx(styles.chatToolsList, isToolOnly && styles.chatToolsListToolOnly)}>
        {toolCards.map(renderToolCard)}
      </div>
    )
  }

  return (
    <div className={clsx('AiAnswerBubble', styles.root)}>
      {shouldRenderAnswerBubble && (
        <Bubble
          className={styles.bubble}
          content={answerContent}
          streaming={turn.answerStreaming}
          typing={turn.answerStreaming ? { effect: 'fade-in' } : false}
          loading={turn.answerLoading && isEmpty(turn.answerMarkdown)}
          styles={{
            content: {
              background: 'transparent',
            },
            footer: {
              marginBlockStart: 6,
            },
          }}
          contentRender={(content) => {
            const normalizedContent = normalizeMarkdownText(content)
            const shouldRenderToolOnlyCards = hasToolCards && hasToolRoleEvents

            return (
              <>
                {shouldRenderToolOnlyCards ? (
                  renderToolCards(true)
                ) : (
                  <>
                    {!!normalizedContent && (
                      <XMarkdown className={styles.markdownRoot} components={markdownComponents}>
                        {normalizedContent}
                      </XMarkdown>
                    )}
                    {renderToolCards()}
                  </>
                )}
              </>
            )
          }}
          footer={
            bubbleActions.length > 0 ? (
              <div className={styles.actionsWrap}>
                <MessageActions actions={bubbleActions} />
              </div>
            ) : null
          }
        />
      )}
      {turn.answerError && <div className={styles.errorText}>{turn.answerError}</div>}
    </div>
  )
}

export default AiAnswerBubble
