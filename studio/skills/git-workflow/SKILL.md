---
name: git-workflow
description: Use when the user wants to generate, rewrite, validate, or prepare Git commit messages, pull request titles, or pull request descriptions.
---

# Git Workflow

## 目标

为当前仓库变更生成可追溯的 Git 提交信息和 Pull Request 内容。输出必须准确反映实际变更，不编造测试结果、需求背景、CI 状态或风险结论。

## 适用场景

- 生成或校验 commit message。
- 生成或校验 PR title。
- 生成或校验 PR description。
- 根据当前分支、暂存区、diff 或用户说明整理提交/PR 文案。
- 判断变更是否应该拆分成多个 commit 或 PR。

## 上下文优先级

1. 用户明确提供的信息：模块名、需求背景、issue、type、测试结果、目标分支。
2. 已暂存变更：`git diff --staged`。
3. 当前分支相对目标分支的提交和 diff。
4. 未暂存变更：`git diff`。
5. 文件状态：`git status --short`。

如果信息不足以判断意图，先问一个具体问题，不要猜。
生成 commit message 时，默认只基于已暂存变更；没有已暂存变更时再说明将基于未暂存变更生成。生成 PR 内容时，默认基于当前分支相对目标分支的已提交变更；未提交变更只能作为额外提醒，不能默认写进 PR 已完成内容。

## 推荐命令

按需读取最小上下文：

```bash
git branch --show-current
git status --short
git diff --staged
git log --oneline main..HEAD
git diff --stat main...HEAD
git diff main...HEAD
```

缺少目标分支时默认使用 `main`；仓库没有 `main` 时尝试 `master`；仍无法判断时询问用户。

## Commit Message

默认使用 Conventional Commits 风格：

```text
<type>(<module>): <subject>
```

模块不明确或变更多模块无法拆分时省略模块：

```text
<type>: <subject>
```

需要正文时：

```text
<type>(<module>): <subject>

<body>

<footer>
```

### Type

| type | 使用场景 |
| --- | --- |
| `feat` | 新增用户可见功能、接口、能力 |
| `fix` | 修复 bug、错误行为、异常处理 |
| `docs` | 文档变更，不影响运行时代码 |
| `test` | 新增或调整测试 |
| `refactor` | 不改变外部行为的代码结构调整 |
| `chore` | 依赖、工具、脚本、配置等维护工作 |
| `build` | 构建系统、打包、镜像相关变更 |
| `ci` | CI/CD 流程或配置变更 |
| `style` | 纯格式化、空白、代码风格调整 |
| `perf` | 性能优化 |
| `revert` | 回滚提交 |

### Module

- module 必须是业务模块或产品模块，例如 `studio`、`hub`。
- 优先使用用户明确给出的模块名。
- 未指定模块名时，根据变更路径、包名、文档语境、功能归属推断。
- 不要把技术层、目录名、资源名直接当 module，例如 `routes`、`types`、`openapi`、`readme`、`deps`，除非它们本身是用户认可的模块。
- 一次提交涉及多个无关模块时，建议拆分；无法拆分时省略 module。
- module 使用小写短横线或单个小写词，避免中文、空格和过长名称。

### Subject

- 使用英文小写祈使句或简洁动词短语。
- 不以句号结尾。
- 控制在 72 个字符以内。
- 只描述本次提交实际包含的主要变更。
- 避免 `update code`、`misc changes`、`fix stuff` 等模糊表达。

### Commit 输出

只要求 commit message 时，默认输出 1 到 3 个候选，推荐项放第一：

```text
1. feat(studio): add agent creation endpoint
2. feat(hub): add workspace sync support
3. feat: add agent creation and workspace sync support
```

如果用户要求校验，输出是否合规、原因和修正版。

## Pull Request

PR title 默认复用 commit message 规则：

```text
<type>(<module>): <subject>
```

如果 PR 包含多个相关 commit，标题描述最终用户可见的整体结果；如果包含多个无关主题，先建议拆分 PR。

### PR Description

默认英文模板：

```markdown
## Summary

- 

## Testing

- 

## Risks

- 
```

用户要求中文时使用：

```markdown
## 变更内容

- 

## 测试

- 

## 风险

- 
```

### PR 内容规则

- Summary/变更内容只写实际发生的变更，避免泛泛描述。
- Testing/测试必须来自真实执行结果或用户提供的信息。
- 未运行测试时写 `Not run (reason: ...)` 或 `未运行（原因：...）`。
- Risks/风险写具体可评审的风险；低风险也要说明依据。
- 修改 HTTP routes 时，检查是否需要提及 OpenAPI 和 README API 文档更新。
- 修改后端接口类型时，检查是否需要提及 `src/types` 变更。
- 不要声称 CI 通过，除非已经看到对应结果。

### PR 输出

默认输出：

```markdown
Title:
feat(studio): add agent creation endpoint

Body:
## Summary

- Add agent creation endpoint.
- Define request and response types.
- Update OpenAPI and README API documentation.

## Testing

- npm test

## Risks

- Low: endpoint behavior is covered by route tests.
```

用户只要求标题时，只输出标题候选；只要求描述时，不输出标题。

## 判断规则

- 代码和测试一起变更：按代码行为选择 type，不使用 `test`。
- 文档随接口变更一起更新：按接口变更选择 type，不使用 `docs`。
- 只更新 OpenAPI、README 或文档：使用 `docs(<module>)`。
- 只修复测试失败且不改变业务行为：使用 `test(<module>)` 或 `chore(<module>)`。
- 修改依赖版本：使用 `chore(<module>)`，subject 说明依赖变更。
- 调整 Dockerfile、Helm Chart、构建脚本：使用 `build(<module>)`。
- 调整 GitHub Actions 或 CI 脚本：使用 `ci(<module>)`。
- 发现多个无关主题：先建议拆分，再分别生成 commit 或 PR 文案。
