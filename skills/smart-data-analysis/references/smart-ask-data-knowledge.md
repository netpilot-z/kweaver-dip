# smart-ask-data 经验沉淀

## 场景

在查询“企业投资者的认缴出资额”时，常见需求是同时展示企业名称、投资者、认缴出资额。

## 问题现象

- 仅查询 `scjg_e_inv_investment`（企业投资者信息）可拿到 `inv`、`subconam`，但企业名称可能缺失。
- 与 `scjg_e_baseinfo` 联表后，若不加约束，结果中可能出现 `企业名称 = null` 的记录。

## 经验结论

当业务要求“企业名称不能为 null”时，必须在 SQL 中显式增加：

- `b.entname IS NOT NULL`

并建议使用 `JOIN`（内连接）替代 `LEFT JOIN`，从结构上避免保留无企业主体匹配的数据。

## 推荐查询模板

```sql
SELECT
  b.entname AS 企业名称,
  i.inv AS 投资者,
  i.subconam AS 认缴出资额_万元
FROM mysql_7wpnfjvg.""adp_gzfrk"".""scjg_e_inv_investment"" i
JOIN mysql_7wpnfjvg.""adp_gzfrk"".""scjg_e_baseinfo"" b
  ON i.pripid = b.pripid
WHERE i.subconam IS NOT NULL
  AND b.entname IS NOT NULL
ORDER BY i.subconam DESC, b.entname ASC, i.inv ASC
```

## 执行口径建议

- 首先统计条数，确认过滤后剩余记录规模（`COUNT(*)`，并带同样的 `WHERE` 条件）。
- 再拉取明细，避免先看明细再发现口径不一致。
- 在回复中明确说明企业名称已过滤 `IS NOT NULL`。
- 在回复中明确说明认缴出资额字段单位为“万元”。

