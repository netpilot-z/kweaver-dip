-- Copyright The kweaver.ai Authors.
--
-- Licensed under the Apache License, Version 2.0.
-- See the LICENSE file in the project root for details.

-- ==========================================
-- 迁移脚本：将 business domain 相关表从 adp 库迁移至 kweaver 库
-- ==========================================
USE kweaver;

RENAME TABLE adp.t_bd_resource_r TO kweaver.t_bd_resource_r;
RENAME TABLE adp.t_bd_product_r TO kweaver.t_bd_product_r;
RENAME TABLE adp.t_business_domain TO kweaver.t_business_domain;
