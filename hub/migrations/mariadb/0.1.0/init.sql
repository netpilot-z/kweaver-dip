USE `dip`;

CREATE TABLE IF NOT EXISTS `t_user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` CHAR(36) NOT NULL COMMENT '用户ID',
    `display_name` VARCHAR(255) NOT NULL COMMENT '用户显示名',
    PRIMARY KEY (`id`),
    INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE IF NOT EXISTS `t_role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `role_id` CHAR(36) NOT NULL COMMENT '角色ID',
    `role_name` VARCHAR(255) NOT NULL COMMENT '角色名称',
    PRIMARY KEY (`id`),
    INDEX `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

CREATE TABLE IF NOT EXISTS `t_user_role` (
    `user_id` CHAR(36) NOT NULL COMMENT '用户ID',
    `role_id` CHAR(36) NOT NULL COMMENT '角色ID',
    PRIMARY KEY (`user_id`, `role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户-角色关系表';

CREATE TABLE IF NOT EXISTS `t_application` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `key` CHAR(32) NOT NULL COMMENT '应用包唯一标识',
    `name` VARCHAR(128) NOT NULL COMMENT '应用名称',
    `description` VARCHAR(800) NULL COMMENT '应用描述',
    `icon` BLOB NULL COMMENT '应用图标（二进制数据）',
    `version` VARCHAR(128) NULL COMMENT '当前上传的版本号',
    `category` VARCHAR(128) NULL COMMENT '应用所属分组',
    `business_domain` VARCHAR(128) NULL DEFAULT 'db_public' COMMENT '业务域',
    `micro_app` TEXT NULL COMMENT '微应用配置（JSON对象）',
    `release_config` TEXT NULL COMMENT '应用安装配置（JSON数组，helm release名称列表）',
    `ontology_ids` TEXT NULL COMMENT '业务知识网络配置（JSON数组，每个元素包含id和is_config字段）',
    `agent_ids` TEXT NULL COMMENT '智能体配置（JSON数组，每个元素包含id和is_config字段）',
    `is_config` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否完成配置',
    `pinned` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否被钉（置顶）',
    `updated_by` VARCHAR(128) NOT NULL COMMENT '更新者用户显示名称',
    `updated_by_id` CHAR(36) NULL COMMENT '更新者用户ID',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_key` (`key`),
    INDEX `idx_updated_by` (`updated_by`),
    INDEX `idx_updated_at` (`updated_at`),
    INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='应用表';
