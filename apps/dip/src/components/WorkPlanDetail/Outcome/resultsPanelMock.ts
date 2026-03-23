import type { SessionArchivesResponse } from '@/apis/dip-studio/sessions'

/** 为 true 时成果 Tab 走本地 mock，不调归档接口 */
export const RESULTS_PANEL_USE_MOCK = false

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** 外层归档目录（与 archiveUtils 目录名格式一致） */
const MOCK_ARCHIVES_ROOT: SessionArchivesResponse = {
  path: '/',
  contents: [
    {
      name: '5346e9bf-a493-4722-a1fc-93d857e96d94_2026-03-20-16-11-32',
      type: 'directory',
    },
    {
      name: '5346e9bf-a493-4722-a1fc-93d857e96d94_2026-03-21-14-27-30',
      type: 'directory',
    },
    {
      name: '5346e9bf-a493-4722-a1fc-93d857e96d94_2026-03-21-14-34-17',
      type: 'directory',
    },
  ],
}

function mockFolderListing(folderName: string): SessionArchivesResponse {
  return {
    path: `/${folderName}`,
    contents: [
      { name: '企业数字员工简报.md', type: 'file' },
      { name: '企业数字员工简报.html', type: 'file' },
      { name: 'config.json', type: 'file' },
      { name: '示例.pdf', type: 'file' },
      { name: '示例.docx', type: 'file' },
      { name: '示例.png', type: 'file' },
      { name: '示例.zip', type: 'file' },
    ],
  }
}

function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

/** 最小可内嵌预览的 PDF（单页） */
const MOCK_MINI_PDF_BASE64 =
  'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCAyMDAgMjAwXT4+CmVuZG9iagp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDI1OSAwMDAwMCBuIAowMDAwMDAwMDc5IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA0L1Jvb3QgMSAwIFI+Pg/startxrefCjEzOAplbm9iagolJUVPRgo='

/** 1×1 透明 PNG，用于 mock 图片类预览 */
const MOCK_1X1_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

/** 二进制：与真实接口一致返回 ArrayBuffer（按扩展名给占位数据） */
function mockBinaryArchiveBody(subpath: string): ArrayBuffer {
  const l = subpath.toLowerCase()
  if (l.endsWith('.pdf')) {
    return base64ToArrayBuffer(MOCK_MINI_PDF_BASE64)
  }
  if (
    l.endsWith('.png') ||
    l.endsWith('.jpg') ||
    l.endsWith('.jpeg') ||
    l.endsWith('.gif') ||
    l.endsWith('.webp') ||
    l.endsWith('.bmp') ||
    l.endsWith('.ico')
  ) {
    return base64ToArrayBuffer(MOCK_1X1_PNG_BASE64)
  }
  if (l.endsWith('.svg')) {
    const svg = new TextEncoder().encode(
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="#ccc"/></svg>',
    )
    return svg.buffer.slice(svg.byteOffset, svg.byteOffset + svg.byteLength)
  }
  if (
    l.endsWith('.doc') ||
    l.endsWith('.docx') ||
    l.endsWith('.ppt') ||
    l.endsWith('.pptx') ||
    l.endsWith('.xls') ||
    l.endsWith('.xlsx')
  ) {
    const stub = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00])
    return stub.buffer
  }
  if (l.endsWith('.zip')) {
    return new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00]).buffer
  }
  return new ArrayBuffer(0)
}

/** Mock：一篇完整 Markdown 样例（GFM），用于本地预览效果 */
function getMockMarkdownSample(subpath: string): string {
  return `# 企业数字员工 · 工作成果简报

> **摘要**：本期由数字员工自动汇总会话产出，以下为 Markdown 预览效果示例。

## 一、关键结论

1. 已完成 **新闻检索** 与 **日报框架** 生成；
2. 输出物包含 \`简报.md\`、\`简报.html\` 与配置 \`config.json\`；
3. 可追溯目录：\`5346e9bf-…_2026-03-21-14-34-17/\`。

## 二、数据片段（表格）

| 指标 | 数值 | 说明 |
| --- | ---: | --- |
| 检索条数 | 128 | mock |
| 生成耗时 | 3.2s | 模拟 |

## 三、代码示例

\`\`\`typescript
export function hello(name: string): string {
  return \`Hello, \${name}\`
}
\`\`\`

## 四、列表与引用

- 无序项 A
- 无序项 B

> 引用块：可用于强调风险提示或补充说明。

---

**路径**：\`${subpath}\` · *由 resultsPanelMock 注入*
`
}

function mockFileBody(
  subpath: string,
  responseType: 'json' | 'text' | 'arraybuffer' | undefined,
): string {
  const lower = subpath.toLowerCase()
  if (lower.endsWith('.json') || responseType === 'json') {
    return JSON.stringify({ mock: true, path: subpath, message: 'mock json 预览' }, null, 2)
  }
  if (lower.endsWith('.html')) {
    return '<!DOCTYPE html><html><body><p>mock html</p></body></html>'
  }
  if (lower.endsWith('.md')) {
    return getMockMarkdownSample(subpath)
  }
  return `# mock\n\n子路径：${subpath}\n\n（Markdown 预览）`
}

export async function mockGetDigitalHumanSessionArchives(): Promise<SessionArchivesResponse> {
  await delay(400)
  return MOCK_ARCHIVES_ROOT
}

export async function mockGetDigitalHumanSessionArchiveSubpath(
  subpath: string,
  options?: { responseType?: 'json' | 'text' | 'arraybuffer' },
): Promise<SessionArchivesResponse | string | ArrayBuffer> {
  await delay(300)
  const rt = options?.responseType

  if (!subpath.includes('/')) {
    const isDir = MOCK_ARCHIVES_ROOT.contents.some(
      (c) => c.type === 'directory' && c.name === subpath,
    )
    if (isDir) {
      return mockFolderListing(subpath)
    }
  }

  if (rt === 'arraybuffer') {
    return mockBinaryArchiveBody(subpath)
  }

  return mockFileBody(subpath, rt ?? 'text')
}
