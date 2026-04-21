{
  "toolbox": {
    "configs": [
      {
        "box_id": "98b66842-aea0-4e95-a8f8-a8c71c2cad54",
        "box_name": "基础工具",
        "box_desc": "基础工具-包括意图识别",
        "box_svc_url": "http://sailor-agent:9595",
        "status": "published",
        "category_type": "other_category",
        "category_name": "未分类",
        "is_internal": false,
        "source": "custom",
        "tools": [
          {
            "tool_id": "9406517b-991f-45cb-b618-8fd1f0248218",
            "name": "todo_list_tool",
            "description": "任务拆分工具，根据用户问题、场景和拆解策略生成任务列表，并保存到 Redis。",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "7f35a7b4-5ca6-4c5c-9070-fb2c72a3bb41",
              "summary": "todo_list_tool",
              "description": "任务拆分工具：mode=generate 新生成；mode=adjust 调整已有未完成任务列表。",
              "server_url": "http://af-sailor-agent:9595",
              "path": "/api/af-sailor-agent/v1/assistant/tools/todo_list",
              "method": "POST",
              "create_time": 1776675274802430200,
              "update_time": 1776675274802430200,
              "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "api_spec": {
                "parameters": [],
                "request_body": {
                  "description": "",
                  "content": {
                    "application/json": {
                      "schema": {
                        "properties": {
                          "auth": {
                            "description": "认证参数",
                            "properties": {
                              "auth_url": {
                                "description": "认证服务URL（可选）",
                                "type": "string"
                              },
                              "password": {
                                "description": "密码（可选）",
                                "type": "string"
                              },
                              "token": {
                                "description": "认证令牌，如提供则无需用户名和密码（推荐）",
                                "type": "string"
                              },
                              "user": {
                                "description": "用户名（可选）",
                                "type": "string"
                              },
                              "user_id": {
                                "description": "用户ID（可选）",
                                "type": "string"
                              }
                            },
                            "type": "object"
                          },
                          "config": {
                            "description": "工具配置参数",
                            "properties": {
                              "background": {
                                "description": "背景信息（可选）",
                                "type": "string"
                              },
                              "session_type": {
                                "default": "redis",
                                "description": "会话类型",
                                "enum": [
                                  "in_memory",
                                  "redis"
                                ],
                                "type": "string"
                              }
                            },
                            "type": "object"
                          },
                          "llm": {
                            "description": "LLM 配置参数（可选）",
                            "type": "object"
                          },
                          "mode": {
                            "default": "generate",
                            "description": "generate 新生成（默认）；adjust 在已有未完成任务列表上调整",
                            "enum": [
                              "generate",
                              "adjust"
                            ],
                            "type": "string"
                          },
                          "query": {
                            "description": "由意图理解工具丰富后的用户问题（必填）",
                            "type": "string"
                          },
                          "scene": {
                            "description": "由意图理解工具得出的用户问题场景（可选）",
                            "type": "string"
                          },
                          "session_id": {
                            "description": "会话ID，用于区分并缓存任务列表（必填）",
                            "type": "string"
                          },
                          "strategy": {
                            "description": "generate 时为拆解策略；adjust 时为调整原因（可选）",
                            "type": "string"
                          },
                          "tools": {
                            "description": "可用工具列表，用于指导任务拆分（可选）",
                            "items": {
                              "properties": {
                                "name": {
                                  "description": "工具名称",
                                  "type": "string"
                                },
                                "purpose": {
                                  "description": "工具作用/适用场景",
                                  "type": "string"
                                }
                              },
                              "required": [
                                "name",
                                "purpose"
                              ],
                              "type": "object"
                            },
                            "type": "array"
                          }
                        },
                        "required": [
                          "query",
                          "session_id"
                        ],
                        "type": "object"
                      }
                    }
                  },
                  "required": false
                },
                "responses": [
                  {
                    "status_code": "200",
                    "description": "Successful operation",
                    "content": {
                      "application/json": {
                        "schema": {
                          "properties": {
                            "mode": {
                              "enum": [
                                "generate",
                                "adjust"
                              ],
                              "type": "string"
                            },
                            "result": {
                              "type": "string"
                            },
                            "session_id": {
                              "type": "string"
                            },
                            "status": {
                              "description": "任务列表整体状态（pending/running/completed）",
                              "type": "string"
                            },
                            "tasks": {
                              "items": {
                                "properties": {
                                  "blockedBy": {
                                    "items": {
                                      "type": "integer"
                                    },
                                    "type": "array"
                                  },
                                  "id": {
                                    "type": "integer"
                                  },
                                  "status": {
                                    "description": "任务状态（pending/running/completed/failed/cancelled）",
                                    "type": "string"
                                  },
                                  "task": {
                                    "type": "string"
                                  },
                                  "tools": {
                                    "items": {
                                      "properties": {
                                        "inputs": {
                                          "type": "string"
                                        },
                                        "name": {
                                          "type": "string"
                                        },
                                        "outputs": {
                                          "type": "string"
                                        }
                                      },
                                      "required": [
                                        "name"
                                      ],
                                      "type": "object"
                                    },
                                    "type": "array"
                                  }
                                },
                                "type": "object"
                              },
                              "type": "array"
                            }
                          },
                          "type": "object"
                        }
                      }
                    }
                  }
                ],
                "components": {
                  "schemas": {}
                },
                "callbacks": null,
                "security": null,
                "tags": null,
                "external_docs": null
              }
            },
            "use_rule": "",
            "global_parameters": {
              "name": "",
              "description": "",
              "required": false,
              "in": "",
              "type": "",
              "value": null
            },
            "create_time": 1776675274804167200,
            "update_time": 1776675274804167200,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "7f35a7b4-5ca6-4c5c-9070-fb2c72a3bb41",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "d527a6ab-d539-4d85-891e-030a27c9516a",
            "name": "task_manager_tool",
            "description": "任务管理工具：获取可执行任务、更新任务状态。与 todo_list_tool 共用 Redis 任务列表。",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "fb2a905e-c510-4af6-8593-a194e21f076c",
              "summary": "task_manager_tool",
              "description": "任务管理工具：op=get_runnable 查询可执行/阻塞/已完成任务；op=update_status 更新单任务状态（可配合 adjust/reason 取消剩余任务）。与 todo_list_tool 共用 Redis。",
              "server_url": "http://af-sailor-agent:9595",
              "path": "/api/af-sailor-agent/v1/assistant/tools/task_manager",
              "method": "POST",
              "create_time": 1776675274802430200,
              "update_time": 1776675274802430200,
              "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "api_spec": {
                "parameters": [],
                "request_body": {
                  "description": "",
                  "content": {
                    "application/json": {
                      "schema": {
                        "properties": {
                          "adjust": {
                            "default": false,
                            "description": "是否需要根据当前任务结果取消或调整后续未完成任务（可选，仅 op=update_status 时有效）",
                            "type": "boolean"
                          },
                          "auth": {
                            "description": "认证参数（与 todo_list_tool 一致）",
                            "properties": {
                              "auth_url": {
                                "description": "认证服务URL（可选，获取 token 时使用）",
                                "type": "string"
                              },
                              "password": {
                                "description": "密码（可选）",
                                "type": "string"
                              },
                              "token": {
                                "description": "认证令牌，如提供则无需用户名和密码（推荐）",
                                "type": "string"
                              },
                              "user": {
                                "description": "用户名（可选）",
                                "type": "string"
                              },
                              "user_id": {
                                "description": "用户ID（可选）",
                                "type": "string"
                              }
                            },
                            "type": "object"
                          },
                          "config": {
                            "description": "工具配置参数（可选）",
                            "properties": {
                              "background": {
                                "description": "背景信息（可选）",
                                "type": "string"
                              },
                              "session_type": {
                                "default": "redis",
                                "description": "会话类型（可选）",
                                "type": "string"
                              }
                            },
                            "type": "object"
                          },
                          "op": {
                            "description": "操作类型（必填）：get_runnable 获取可执行任务；update_status 更新任务状态",
                            "enum": [
                              "get_runnable",
                              "update_status"
                            ],
                            "type": "string"
                          },
                          "reason": {
                            "description": "调整原因说明（op=update_status 且 adjust=true 时可选）",
                            "type": "string"
                          },
                          "session_id": {
                            "description": "会话ID，用于区分并管理任务列表（必填）",
                            "type": "string"
                          },
                          "status": {
                            "description": "当 op 为 update_status 时必填，新状态：pending / running / completed / failed / cancelled",
                            "type": "string"
                          },
                          "task_id": {
                            "description": "当 op 为 update_status 时必填，要更新的任务ID",
                            "type": "integer"
                          }
                        },
                        "required": [
                          "session_id",
                          "op"
                        ],
                        "type": "object"
                      }
                    }
                  },
                  "required": false
                },
                "responses": [
                  {
                    "status_code": "200",
                    "description": "Successful operation",
                    "content": {
                      "application/json": {
                        "schema": {
                          "properties": {
                            "blocked_tasks": {
                              "description": "被前置任务阻塞的任务列表",
                              "items": {
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "completed_tasks": {
                              "description": "已完成的任务列表",
                              "items": {
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "result": {
                              "type": "string"
                            },
                            "runnable_tasks": {
                              "description": "当前可直接执行的任务列表（get_runnable / update_status 成功时常见）",
                              "items": {
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "session_id": {
                              "type": "string"
                            },
                            "status": {
                              "description": "任务列表整体状态（pending/running/completed/empty）",
                              "type": "string"
                            },
                            "tasks": {
                              "description": "全量任务列表（随接口路径可能为快照或更新后列表）",
                              "items": {
                                "properties": {
                                  "blockedBy": {
                                    "items": {
                                      "type": "integer"
                                    },
                                    "type": "array"
                                  },
                                  "id": {
                                    "type": "integer"
                                  },
                                  "status": {
                                    "description": "任务状态（pending/running/completed/failed/cancelled）",
                                    "type": "string"
                                  },
                                  "task": {
                                    "description": "任务内容（与 todo_list 缓存结构一致）",
                                    "type": "string"
                                  },
                                  "tools": {
                                    "items": {
                                      "properties": {
                                        "inputs": {
                                          "type": "string"
                                        },
                                        "name": {
                                          "type": "string"
                                        },
                                        "outputs": {
                                          "type": "string"
                                        }
                                      },
                                      "required": [
                                        "name"
                                      ],
                                      "type": "object"
                                    },
                                    "type": "array"
                                  }
                                },
                                "type": "object"
                              },
                              "type": "array"
                            }
                          },
                          "type": "object"
                        }
                      }
                    }
                  }
                ],
                "components": {
                  "schemas": {}
                },
                "callbacks": null,
                "security": null,
                "tags": null,
                "external_docs": null
              }
            },
            "use_rule": "",
            "global_parameters": {
              "name": "",
              "description": "",
              "required": false,
              "in": "",
              "type": "",
              "value": null
            },
            "create_time": 1776675274804167200,
            "update_time": 1776675274804167200,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "fb2a905e-c510-4af6-8593-a194e21f076c",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "09ff1c33-34b4-4948-bd00-e403c51f8b52",
            "name": "intent_router",
            "description": "意图路由工具：根据可配置的多意图列表（名称/关键词/示例）对用户输入进行意图识别；模糊时返回澄清反问。",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "6187dacf-9e34-433f-a0c5-fd3bec511ac2",
              "summary": "intent_router",
              "description": "意图路由工具：根据可配置的多意图列表（名称/关键词/示例）对用户输入进行意图识别；模糊时返回澄清反问。",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/tools/intent_router",
              "method": "POST",
              "create_time": 1776675274802430200,
              "update_time": 1776675274802430200,
              "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "api_spec": {
                "parameters": [],
                "request_body": {
                  "description": "",
                  "content": {
                    "application/json": {
                      "examples": {
                        "default": {
                          "summary": "意图路由示例",
                          "value": {
                            "auth": {
                              "token": "Bearer xxx"
                            },
                            "enable_field_clarify": true,
                            "intents": {
                              "找数/问数_找表": {
                                "examples": [
                                  "帮我找2025年销售数据表",
                                  "用户留存率的表叫什么"
                                ],
                                "keywords": [
                                  "找表",
                                  "数据表",
                                  "表名",
                                  "数据表格"
                                ]
                              },
                              "找数/问数_数据查询": {
                                "examples": [
                                  "查询2025年Q1销售额",
                                  "北京地区用户数是多少",
                                  "筛选出客单价大于1000的订单",
                                  "排除2024年的数据"
                                ],
                                "keywords": [
                                  "查询",
                                  "查一下",
                                  "是多少",
                                  "数据值",
                                  "筛选",
                                  "过滤",
                                  "排除",
                                  "大于",
                                  "小于",
                                  "等于"
                                ]
                              },
                              "报告编写": {
                                "examples": [
                                  "基于Q2销售数据生成分析报告初稿",
                                  "写一份用户增长数据的周报"
                                ],
                                "keywords": [
                                  "报告",
                                  "初稿",
                                  "写一份",
                                  "生成报告"
                                ]
                              },
                              "数据分析_对比": {
                                "examples": [
                                  "对比北京和上海的转化率",
                                  "2024和2025年的复购率对比"
                                ],
                                "keywords": [
                                  "对比",
                                  "比较",
                                  "和...比",
                                  "差异"
                                ]
                              },
                              "数据分析_归因": {
                                "examples": [
                                  "分析销售额下降的原因",
                                  "为什么Q2的用户留存率降"
                                ],
                                "keywords": [
                                  "原因",
                                  "归因",
                                  "为什么",
                                  "分析...原因"
                                ]
                              },
                              "数据分析_趋势": {
                                "examples": [
                                  "分析近6个月的用户增长趋势",
                                  "销售额的月度变化趋势是什么"
                                ],
                                "keywords": [
                                  "趋势",
                                  "变化",
                                  "走势",
                                  "月度变化"
                                ]
                              },
                              "数据分析_预测": {
                                "examples": [
                                  "筛选出客单价大于1000的订单",
                                  "排除2024年的数据"
                                ],
                                "keywords": [
                                  "预测",
                                  "预估",
                                  "预计",
                                  "推算"
                                ]
                              },
                              "数据解读_核心结论": {
                                "examples": [
                                  "解读一下这份用户行为数据的核心结论",
                                  "总结下Q2的运营数据亮点"
                                ],
                                "keywords": [
                                  "解读",
                                  "结论",
                                  "总结",
                                  "亮点"
                                ]
                              }
                            },
                            "kn_id": "idrm_metadata_knowledge_network_lbb",
                            "llm": {
                              "name": "Tome-pro"
                            },
                            "min_confidence": 0.6,
                            "min_margin": 0.15,
                            "query": "帮我找2025年销售数据表",
                            "report_intents": false,
                            "top_k": 3
                          }
                        }
                      },
                      "schema": {
                        "properties": {
                          "auth": {
                            "description": "可选，鉴权信息。",
                            "properties": {
                              "token": {
                                "description": "认证令牌，支持 Bearer token",
                                "type": "string"
                              },
                              "user_id": {
                                "description": "可选，用户ID",
                                "type": "string"
                              }
                            },
                            "type": "object"
                          },
                          "background": {
                            "description": "用于大模型意图识别的背景信息/参考上下文（可选）。当需要调用大模型澄清或做最终判别时会传入提示词。",
                            "type": "string"
                          },
                          "enable_field_clarify": {
                            "default": true,
                            "description": "是否启用字段消歧（识别 query 中可能歧义的名词并返回候选含义）",
                            "type": "boolean"
                          },
                          "intents": {
                            "description": "意图配置：{intent_name: {keywords: [...], examples: [...]}}",
                            "type": "object"
                          },
                          "kn_id": {
                            "default": "idrm_metadata_knowledge_network_lbb",
                            "description": "可选，知识网络ID",
                            "type": "string"
                          },
                          "llm": {
                            "description": "LLM 配置参数",
                            "type": "object"
                          },
                          "min_confidence": {
                            "default": 0.6,
                            "maximum": 1,
                            "minimum": 0,
                            "type": "number"
                          },
                          "min_margin": {
                            "default": 0.15,
                            "maximum": 1,
                            "minimum": 0,
                            "type": "number"
                          },
                          "query": {
                            "description": "用户输入的原始问题/需求",
                            "type": "string"
                          },
                          "report_intents": {
                            "default": false,
                            "type": "boolean"
                          },
                          "top_k": {
                            "default": 3,
                            "maximum": 10,
                            "minimum": 1,
                            "type": "integer"
                          }
                        },
                        "required": [
                          "query"
                        ],
                        "type": "object"
                      }
                    }
                  },
                  "required": false
                },
                "responses": [
                  {
                    "status_code": "200",
                    "description": "Successful operation",
                    "content": {
                      "application/json": {
                        "schema": {
                          "properties": {
                            "clarify_questions": {
                              "description": "澄清问题建议",
                              "items": {
                                "type": "string"
                              },
                              "type": "array"
                            },
                            "confidence": {
                              "description": "意图置信度",
                              "type": "number"
                            },
                            "field_clarify": {
                              "description": "字段消歧信息",
                              "items": {
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "intent": {
                              "description": "最终意图（需澄清时为空）",
                              "type": "string"
                            },
                            "intent_clarify": {
                              "description": "意图澄清选项（多选）",
                              "type": "object"
                            },
                            "is_unknown": {
                              "description": "是否未知意图",
                              "type": "boolean"
                            },
                            "need_clarify": {
                              "description": "是否需要澄清",
                              "type": "boolean"
                            },
                            "noun_phrases": {
                              "description": "模糊意图时由LLM抽取的名词/名词短语",
                              "items": {
                                "type": "string"
                              },
                              "type": "array"
                            },
                            "refer_clarify": {
                              "description": "指代澄清信息",
                              "items": {
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "slots": {
                              "description": "抽取槽位",
                              "type": "object"
                            },
                            "summary_text": {
                              "description": "中文摘要文本",
                              "type": "string"
                            }
                          },
                          "type": "object"
                        }
                      }
                    }
                  }
                ],
                "components": {
                  "schemas": {}
                },
                "callbacks": null,
                "security": null,
                "tags": null,
                "external_docs": null
              }
            },
            "use_rule": "",
            "global_parameters": {
              "name": "",
              "description": "",
              "required": false,
              "in": "",
              "type": "",
              "value": null
            },
            "create_time": 1776675274804167200,
            "update_time": 1776675274804167200,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "6187dacf-9e34-433f-a0c5-fd3bec511ac2",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          }
        ],
        "create_time": 1776675274799852800,
        "update_time": 1776675311934564000,
        "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
        "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
        "metadata_type": "openapi"
      }
    ]
  }
}