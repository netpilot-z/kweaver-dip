USE dip;

CREATE TABLE IF NOT EXISTS t_user (
    id BIGINT NOT NULL IDENTITY(1, 1) COMMENT '主键ID',
    user_id CHAR(36) NOT NULL COMMENT '用户ID',
    display_name VARCHAR(255 char) NOT NULL COMMENT '用户显示名',
    CLUSTER PRIMARY KEY (id),
    KEY idx_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS t_role (
    id BIGINT NOT NULL IDENTITY(1, 1) COMMENT '主键ID',
    role_id CHAR(36) NOT NULL COMMENT '角色ID',
    role_name VARCHAR(255 char) NOT NULL COMMENT '角色名称',
    CLUSTER PRIMARY KEY (id),
    KEY idx_role_id (role_id)
);

CREATE TABLE IF NOT EXISTS t_user_role (
    user_id CHAR(36) NOT NULL COMMENT '用户ID',
    role_id CHAR(36) NOT NULL COMMENT '角色ID',
    CLUSTER PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS t_application (
    id BIGINT NOT NULL IDENTITY(1, 1) COMMENT '主键ID',
    "key" CHAR(32) NOT NULL COMMENT '应用包唯一标识',
    name VARCHAR(128 char) NOT NULL COMMENT '应用名称',
    description VARCHAR(800 char) NULL COMMENT '应用描述',
    icon BLOB NULL COMMENT '应用图标（二进制数据）',
    version VARCHAR(128 char) NULL COMMENT '当前上传的版本号',
    category VARCHAR(128 char) NULL COMMENT '应用所属分组',
    business_domain VARCHAR(128 char) NULL DEFAULT 'db_public' COMMENT '业务域',
    micro_app TEXT NULL COMMENT '微应用配置（JSON对象）',
    release_config TEXT NULL COMMENT '应用安装配置（JSON数组，helm release名称列表）',
    ontology_ids TEXT NULL COMMENT '业务知识网络配置（JSON数组，每个元素包含id和is_config字段）',
    agent_ids TEXT NULL COMMENT '智能体配置（JSON数组，每个元素包含id和is_config字段）',
    is_config INT NOT NULL DEFAULT 0 COMMENT '是否完成配置',
    pinned INT NOT NULL DEFAULT 0 COMMENT '是否被钉（置顶）',
    updated_by VARCHAR(128 char) NOT NULL COMMENT '更新者用户显示名称',
    updated_by_id CHAR(36) NULL COMMENT '更新者用户ID',
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    CLUSTER PRIMARY KEY (id),
    UNIQUE KEY idx_key ("key"),
    KEY idx_updated_by (updated_by),
    KEY idx_updated_at (updated_at),
    KEY idx_category (category)
);

COMMENT ON TABLE t_user IS '用户表';
COMMENT ON TABLE t_role IS '角色表';
COMMENT ON TABLE t_user_role IS '用户-角色关系表';
COMMENT ON TABLE t_application IS '应用表';
