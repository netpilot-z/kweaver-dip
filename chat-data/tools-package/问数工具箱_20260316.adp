{
  "toolbox": {
    "configs": [
      {
        "box_id": "f3a5a1fd-22e6-4548-8dd2-f45a76195809",
        "box_name": "问数工具箱_20260316",
        "box_desc": "问数工具箱",
        "box_svc_url": "http://sailor-agent:9595",
        "status": "published",
        "category_type": "other_category",
        "category_name": "未分类",
        "is_internal": false,
        "source": "custom",
        "tools": [
          {
            "tool_id": "dc93dec2-b462-4926-a915-2f8eddbfd7a3",
            "name": "create_file_legacy",
            "description": "在沙箱环境中创建新文件，支持文本内容或从缓存中获取内容",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "9da2913b-effe-4249-873c-357db923351a",
              "summary": "create_file_legacy",
              "description": "在沙箱环境中创建新文件，支持文本内容或从缓存中获取内容",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/tools/create_file",
              "method": "POST",
              "create_time": 1776675263984471000,
              "update_time": 1776675263984471000,
              "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "api_spec": {
                "parameters": [
                  {
                    "name": "stream",
                    "in": "query",
                    "description": "是否流式返回",
                    "required": false,
                    "schema": {
                      "default": false,
                      "type": "boolean"
                    }
                  },
                  {
                    "name": "mode",
                    "in": "query",
                    "description": "请求模式",
                    "required": false,
                    "schema": {
                      "default": "http",
                      "enum": [
                        "http",
                        "sse"
                      ],
                      "type": "string"
                    }
                  }
                ],
                "request_body": {
                  "description": "",
                  "content": {
                    "application/json": {
                      "examples": {
                        "create_from_cache": {
                          "description": "使用缓存中的数据创建文件",
                          "summary": "从缓存创建文件",
                          "value": {
                            "filename": "data.json",
                            "result_cache_key": "cached_data_123",
                            "server_url": "http://localhost:8080",
                            "session_id": "test_session_123"
                          }
                        },
                        "create_python_file": {
                          "description": "创建包含 Python 代码的文件",
                          "summary": "创建 Python 文件",
                          "value": {
                            "content": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\n# 计算前10个斐波那契数\nfor i in range(10):\n    print(f'F({i}) = {fibonacci(i)}')",
                            "filename": "fibonacci.py",
                            "server_url": "http://localhost:8080",
                            "session_id": "test_session_123"
                          }
                        }
                      },
                      "schema": {
                        "properties": {
                          "content": {
                            "description": "文件内容, 如果 result_cache_key 参数不为空，则无需设置该参数",
                            "type": "string"
                          },
                          "filename": {
                            "description": "要创建的文件名",
                            "type": "string"
                          },
                          "result_cache_key": {
                            "description": "之前工具的结果缓存key，可以用于将结果写入到文件中，有此参数则无需设置 content 参数",
                            "type": "string"
                          },
                          "server_url": {
                            "default": "http://sandbox-control-plane:8000",
                            "description": "可选，沙箱服务器URL，默认使用配置文件中的 SANDBOX_URL",
                            "type": "string"
                          },
                          "session_id": {
                            "description": "沙箱会话ID",
                            "type": "string"
                          },
                          "session_type": {
                            "description": "会话类型, 可选值为: redis, in_memory, 默认值为 redis",
                            "type": "string"
                          },
                          "timeout": {
                            "default": 120,
                            "description": "超时时间",
                            "type": "number"
                          },
                          "title": {
                            "description": "对于当前操作的简单描述，便于用户理解",
                            "type": "string"
                          }
                        },
                        "required": [
                          "filename"
                        ],
                        "type": "object"
                      }
                    }
                  },
                  "required": false
                },
                "responses": [
                  {
                    "status_code": "400",
                    "description": "Bad request",
                    "content": {
                      "application/json": {
                        "schema": {
                          "properties": {
                            "detail": {
                              "description": "详细错误信息",
                              "type": "string"
                            },
                            "error": {
                              "description": "错误信息",
                              "type": "string"
                            }
                          },
                          "type": "object"
                        }
                      }
                    }
                  },
                  {
                    "status_code": "200",
                    "description": "Successful operation",
                    "content": {
                      "application/json": {
                        "schema": {
                          "properties": {
                            "message": {
                              "description": "操作状态消息",
                              "type": "string"
                            },
                            "result": {
                              "description": "操作结果, 包含标准输出、标准错误输出、返回值",
                              "type": "object"
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
            "create_time": 1776675263994095000,
            "update_time": 1776675263994095000,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "9da2913b-effe-4249-873c-357db923351a",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "7544dbbb-1f17-4988-ba94-e3d3f8ad6eb7",
            "name": "get_metadata",
            "description": "获取数据视图和指标的元数据信息，支持从知识网络(kn)中获取数据源",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "1c1b42bd-b86b-4978-b86d-34bafec0873c",
              "summary": "get_metadata",
              "description": "获取数据视图和指标的元数据信息，支持从知识网络(kn)中获取数据源",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/tools/get_metadata",
              "method": "POST",
              "create_time": 1776675263984471000,
              "update_time": 1776675263984471000,
              "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "api_spec": {
                "parameters": [
                  {
                    "name": "stream",
                    "in": "query",
                    "description": "是否流式返回",
                    "required": false,
                    "schema": {
                      "default": false,
                      "type": "boolean"
                    }
                  },
                  {
                    "name": "mode",
                    "in": "query",
                    "description": "请求模式",
                    "required": false,
                    "schema": {
                      "default": "http",
                      "enum": [
                        "http",
                        "sse"
                      ],
                      "type": "string"
                    }
                  }
                ],
                "request_body": {
                  "description": "",
                  "content": {
                    "application/json": {
                      "example": {
                        "config": {
                          "data_source_num_limit": 10,
                          "dimension_num_limit": 30,
                          "session_id": "123",
                          "session_type": "redis",
                          "with_sample": false
                        },
                        "data_source": {
                          "account_type": "user",
                          "base_url": "https://xxxxx",
                          "kn": [
                            {
                              "knowledge_network_id": "kn_id_1"
                            }
                          ],
                          "metric_list": [
                            "metric_id_1",
                            "metric_id_2"
                          ],
                          "recall_mode": "keyword_vector_retrieval",
                          "search_scope": [
                            "object_types",
                            "relation_types",
                            "action_types"
                          ],
                          "token": "",
                          "user_id": "",
                          "view_list": [
                            "view_id_1",
                            "view_id_2"
                          ]
                        },
                        "ds_type": "data_view",
                        "query": "查询数据视图和指标的元数据",
                        "with_sample": false
                      },
                      "schema": {
                        "properties": {
                          "config": {
                            "description": "工具配置参数",
                            "properties": {
                              "data_source_num_limit": {
                                "default": -1,
                                "description": "数据源数量限制，-1表示不限制",
                                "type": "integer"
                              },
                              "dimension_num_limit": {
                                "default": 30,
                                "description": "维度数量限制，-1表示不限制, 系统默认为 30",
                                "type": "integer"
                              },
                              "ds_type": {
                                "description": "数据源类型过滤，data_view 表示只获取数据视图，metric 表示只获取指标，all 或不指定则获取所有类型",
                                "enum": [
                                  "data_view",
                                  "metric",
                                  "all"
                                ],
                                "type": "string"
                              },
                              "session_id": {
                                "description": "会话ID",
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
                              },
                              "with_sample": {
                                "default": false,
                                "description": "是否获取数据样例",
                                "type": "boolean"
                              }
                            },
                            "type": "object"
                          },
                          "data_source": {
                            "description": "数据源配置信息",
                            "properties": {
                              "account_type": {
                                "default": "user",
                                "description": "调用者的类型，user 代表普通用户，app 代表应用账号，anonymous 代表匿名用户",
                                "enum": [
                                  "user",
                                  "app",
                                  "anonymous"
                                ],
                                "type": "string"
                              },
                              "base_url": {
                                "description": "服务器地址",
                                "type": "string"
                              },
                              "kn": {
                                "description": "知识网络配置参数（新版本），用于从知识网络中获取数据源。注意：kn 可以获取数据视图（data_view）和指标（metric）",
                                "items": {
                                  "properties": {
                                    "knowledge_network_id": {
                                      "description": "知识网络ID",
                                      "type": "string"
                                    },
                                    "object_types": {
                                      "description": "知识网络对象类型",
                                      "items": {
                                        "type": "string"
                                      },
                                      "type": "array"
                                    }
                                  },
                                  "required": [
                                    "knowledge_network_id"
                                  ],
                                  "type": "object"
                                },
                                "type": "array"
                              },
                              "metric_list": {
                                "description": "指标ID列表",
                                "items": {
                                  "type": "string"
                                },
                                "type": "array"
                              },
                              "recall_mode": {
                                "default": "keyword_vector_retrieval",
                                "description": "召回模式，支持 keyword_vector_retrieval(默认), agent_intent_planning, agent_intent_retrieval",
                                "enum": [
                                  "keyword_vector_retrieval",
                                  "agent_intent_planning",
                                  "agent_intent_retrieval"
                                ],
                                "type": "string"
                              },
                              "search_scope": {
                                "description": "知识网络搜索范围，支持 object_types, relation_types, action_types",
                                "items": {
                                  "type": "string"
                                },
                                "type": "array"
                              },
                              "token": {
                                "description": "认证令牌",
                                "type": "string"
                              },
                              "user_id": {
                                "description": "用户ID",
                                "type": "string"
                              },
                              "view_list": {
                                "description": "数据视图ID列表",
                                "items": {
                                  "type": "string"
                                },
                                "type": "array"
                              }
                            },
                            "type": "object"
                          },
                          "query": {
                            "description": "查询语句，用于从知识网络中检索相关数据源",
                            "type": "string"
                          },
                          "timeout": {
                            "default": 120,
                            "description": "请求超时时间（秒），超过此时间未完成则返回超时错误，默认120秒",
                            "type": "number"
                          },
                          "with_sample": {
                            "default": false,
                            "description": "是否获取数据样例",
                            "type": "boolean"
                          }
                        },
                        "required": [
                          "data_source"
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
                        "example": {
                          "data_view_metadata": {
                            "view_id_1": {
                              "comment": "数据视图描述",
                              "fields": [
                                {
                                  "comment": "字段描述",
                                  "name": "字段名",
                                  "type": "string"
                                }
                              ],
                              "id": "view_id_1",
                              "name": "数据视图名称"
                            }
                          },
                          "data_view_summary": [
                            {
                              "comment": "数据视图描述",
                              "name": "数据视图名称",
                              "table_path": "catalog.schema.table"
                            }
                          ],
                          "metric_metadata": {
                            "metric_id_1": {
                              "analysis_dimensions": [],
                              "comment": "指标描述",
                              "formula_config": {},
                              "id": "metric_id_1",
                              "name": "指标名称"
                            }
                          },
                          "metric_summary": [
                            {
                              "comment": "指标描述",
                              "id": "metric_id_1",
                              "name": "指标名称"
                            }
                          ],
                          "title": "获取数据源信息"
                        },
                        "schema": {
                          "properties": {
                            "data_view_metadata": {
                              "description": "数据视图元数据，key 为数据视图ID，value 为元数据信息",
                              "type": "object"
                            },
                            "data_view_summary": {
                              "description": "数据视图摘要列表",
                              "items": {
                                "properties": {
                                  "comment": {
                                    "description": "数据视图描述",
                                    "type": "string"
                                  },
                                  "name": {
                                    "description": "数据视图名称",
                                    "type": "string"
                                  },
                                  "table_path": {
                                    "description": "数据视图路径",
                                    "type": "string"
                                  }
                                },
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "errors": {
                              "description": "错误信息列表（如果存在）",
                              "items": {
                                "type": "string"
                              },
                              "type": "array"
                            },
                            "metric_metadata": {
                              "description": "指标元数据，key 为指标ID，value 为元数据信息",
                              "type": "object"
                            },
                            "metric_summary": {
                              "description": "指标摘要列表",
                              "items": {
                                "properties": {
                                  "comment": {
                                    "description": "指标描述",
                                    "type": "string"
                                  },
                                  "id": {
                                    "description": "指标ID",
                                    "type": "string"
                                  },
                                  "name": {
                                    "description": "指标名称",
                                    "type": "string"
                                  }
                                },
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "title": {
                              "description": "结果标题",
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
            "create_time": 1776675263994095000,
            "update_time": 1776675263994095000,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "1c1b42bd-b86b-4978-b86d-34bafec0873c",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "a2bfbe48-4252-439e-8f1e-7312b0931e7c",
            "name": "json2plot",
            "description": "根据绘图参数生成用于前端展示的 JSON 对象。如果包含此工具，则优先使用此工具绘图\n\n调用方法是 `json2plot(title, chart_type, group_by, data_field, tool_result_cache_key)`\n\n**注意：**\n- 你拿到结果后, 不需要给用户展示这个 JSON 对象, 前端会自动画图",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "a5759749-8cea-411a-9a43-7eeafd2fcfd9",
              "summary": "json2plot",
              "description": "根据绘图参数生成用于前端展示的 JSON 对象。如果包含此工具，则优先使用此工具绘图\n\n调用方法是 `json2plot(title, chart_type, group_by, data_field, tool_result_cache_key)`\n\n**注意：**\n- 你拿到结果后, 不需要给用户展示这个 JSON 对象, 前端会自动画图",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/tools/json2plot",
              "method": "POST",
              "create_time": 1776675263984471000,
              "update_time": 1776675263984471000,
              "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "api_spec": {
                "parameters": [
                  {
                    "name": "stream",
                    "in": "query",
                    "description": "是否流式返回",
                    "required": false,
                    "schema": {
                      "default": false,
                      "type": "boolean"
                    }
                  },
                  {
                    "name": "mode",
                    "in": "query",
                    "description": "请求模式",
                    "required": false,
                    "schema": {
                      "default": "http",
                      "enum": [
                        "http",
                        "sse"
                      ],
                      "type": "string"
                    }
                  }
                ],
                "request_body": {
                  "description": "",
                  "content": {
                    "application/json": {
                      "schema": {
                        "example": {
                          "chart_type": "Line",
                          "data": [],
                          "data_field": "营收收入指标",
                          "group_by": [
                            "报告时间(按年)"
                          ],
                          "session_id": "123",
                          "session_type": "in_memory",
                          "title": "2024年1月1日到2024年1月3日，每天的销售额",
                          "tool_result_cache_key": ""
                        },
                        "properties": {
                          "chart_type": {
                            "description": "图表的类型, 输出仅支持三种: Pie, Line, Column, 环形图也属于 Pie",
                            "enum": [
                              "Pie",
                              "Line",
                              "Column"
                            ],
                            "type": "string"
                          },
                          "data": {
                            "description": "用于作图的 JSON 数据，与 tool_result_cache_key 参数不能同时设置。如果 tool_result_cache_key 为空，则使用此参数。数据格式为对象数组，每个对象表示一条数据记录",
                            "items": {
                              "additionalProperties": {
                                "type": [
                                  "string",
                                  "number"
                                ]
                              },
                              "type": "object"
                            },
                            "type": "array"
                          },
                          "data_field": {
                            "description": "数据字段，注意设置的 group_by 和 data_field 必须和数据匹配，不要自己生成，如果数据中没有，可以询问用户",
                            "type": "string"
                          },
                          "group_by": {
                            "description": "\n分组字段列表，支持多个字段，如果有时间字段，请放在第一位。另外:\n- 对于折线图, group_by 可能有1~2个值, 第一个是 x 轴, 第二个字段是 分组, data_field 是 y 轴\n- 对于柱状图, group_by 可能有1~3个值, 第一个是 x 轴, 第二个字段是 堆叠, 第三个字段是 分组, data_field 是 y 轴\n- 对于饼图, group_by 只有一个值, 即 colorField, data_field 是 angleField\n",
                            "items": {
                              "type": "string"
                            },
                            "type": "array"
                          },
                          "session_id": {
                            "description": "会话ID，用于标识和管理会话状态，同一会话ID可以共享历史数据和缓存",
                            "type": "string"
                          },
                          "session_type": {
                            "default": "redis",
                            "description": "会话类型，in_memory 表示内存存储（临时），redis 表示 Redis 存储（持久化）",
                            "enum": [
                              "in_memory",
                              "redis"
                            ],
                            "type": "string"
                          },
                          "timeout": {
                            "default": 30,
                            "description": "请求超时时间（秒），超过此时间未完成则返回超时错误，默认30秒",
                            "type": "number"
                          },
                          "title": {
                            "description": "和数据的 title 保持一致, 是一个字符串, **不是dict**",
                            "type": "string"
                          },
                          "tool_result_cache_key": {
                            "description": "text2metric 或 text2sql工具缓存 key, 其他工具的结果没有意义，key 是一个字符串, 与 data 不能同时设置",
                            "type": "string"
                          }
                        },
                        "required": [
                          "title",
                          "chart_type",
                          "group_by",
                          "data_field"
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
                        "example": {
                          "output": {
                            "chart_config": {
                              "chart_type": "Column",
                              "groupField": "",
                              "seriesField": "报告类型",
                              "xField": "报告时间(按年)",
                              "yField": "营收收入指标"
                            },
                            "config": {
                              "angleField": "",
                              "chart_type": "Column",
                              "colorField": "",
                              "xField": "报告时间(按年)",
                              "yField": "营收收入指标"
                            },
                            "data_sample": [
                              {
                                "报告时间(按年)": "2015",
                                "报告类型": "一季报",
                                "营收收入指标": 12312312
                              }
                            ],
                            "result_cache_key": "CACHE_KEY",
                            "title": "2024年1月1日到2024年1月3日，每天的销售额"
                          }
                        },
                        "schema": {
                          "properties": {
                            "chart_config": {
                              "description": "详细图表配置，包含完整的图表渲染参数，如 xField（X轴字段）、yField（Y轴字段）、seriesField（系列字段）、groupField（分组字段）等",
                              "type": "object"
                            },
                            "config": {
                              "description": "基础图表配置，包含图表类型、坐标轴字段等基础信息",
                              "type": "object"
                            },
                            "data_sample": {
                              "description": "数据样例，仅返回第一条数据用于预览，完整数据需通过 result_cache_key 从缓存获取",
                              "items": {
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "result_cache_key": {
                              "description": "结果缓存键，用于从缓存中获取完整数据，前端可通过此键获取完整图表数据",
                              "type": "string"
                            },
                            "title": {
                              "description": "图表标题，用于前端展示",
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
            "create_time": 1776675263994095000,
            "update_time": 1776675263994095000,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "a5759749-8cea-411a-9a43-7eeafd2fcfd9",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "4c448201-29b7-4e80-9846-98414576f7ee",
            "name": "sql_helper",
            "description": "专门用于调用 SQL 语句的工具，支持获取元数据信息和执行 SQL 语句。注意：此工具不生成 SQL 语句，只执行已提供的 SQL 语句。",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "bc8378f5-ef31-4b0c-9cec-5526ad74a5b8",
              "summary": "sql_helper",
              "description": "专门用于调用 SQL 语句的工具，支持获取元数据信息和执行 SQL 语句。注意：此工具不生成 SQL 语句，只执行已提供的 SQL 语句。",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/tools/sql_helper",
              "method": "POST",
              "create_time": 1776675263984471000,
              "update_time": 1776675263984471000,
              "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "api_spec": {
                "parameters": [
                  {
                    "name": "stream",
                    "in": "query",
                    "description": "是否流式返回",
                    "required": false,
                    "schema": {
                      "default": false,
                      "type": "boolean"
                    }
                  },
                  {
                    "name": "mode",
                    "in": "query",
                    "description": "请求模式",
                    "required": false,
                    "schema": {
                      "default": "http",
                      "enum": [
                        "http",
                        "sse"
                      ],
                      "type": "string"
                    }
                  }
                ],
                "request_body": {
                  "description": "",
                  "content": {
                    "application/json": {
                      "example": {
                        "command": "execute_sql",
                        "config": {
                          "dimension_num_limit": 30,
                          "force_limit": 200,
                          "get_desc_from_datasource": false,
                          "return_data_limit": 1000,
                          "return_record_limit": 10,
                          "session_id": "123",
                          "session_type": "redis",
                          "view_num_limit": 5,
                          "with_sample": true
                        },
                        "data_source": {
                          "account_type": "user",
                          "base_url": "https://xxxxx",
                          "kn": [
                            {
                              "knowledge_network_id": "129",
                              "object_types": [
                                "data_view",
                                "metric"
                              ]
                            }
                          ],
                          "recall_mode": "keyword_vector_retrieval",
                          "search_scope": [
                            "object_types",
                            "relation_types",
                            "action_types"
                          ],
                          "token": "",
                          "user_id": "",
                          "view_list": [
                            "view_id"
                          ]
                        },
                        "sql": "SELECT * FROM table LIMIT 10",
                        "timeout": 120,
                        "title": "数据的标题"
                      },
                      "schema": {
                        "properties": {
                          "command": {
                            "default": "execute_sql",
                            "description": "命令类型，其中 get_metadata 表示获取元数据信息，execute_sql 表示执行 SQL 语句",
                            "enum": [
                              "get_metadata",
                              "execute_sql"
                            ],
                            "type": "string"
                          },
                          "config": {
                            "description": "工具配置参数",
                            "properties": {
                              "dimension_num_limit": {
                                "default": 30,
                                "description": "获取元数据时维度数量限制，-1表示不限制, 系统默认为 30。注意：此参数仅在 command 为 get_metadata 时有效，在 command 为 execute_sql 时无效，因为工具会严格执行 SQL，不会限制维度数量",
                                "type": "integer"
                              },
                              "force_limit": {
                                "default": 200,
                                "description": "强制限制SQL查询的行数。在SQL执行前，工具会将原始SQL包装为子查询并添加 LIMIT 子句，限制返回的数据条数。系统默认为 200。如果设置为 0 或负数，则不添加 LIMIT 限制。注意：此参数仅在 command 为 execute_sql 时有效，在 SQL 执行前生效，会影响实际查询的数据量",
                                "type": "integer"
                              },
                              "return_data_limit": {
                                "default": 5000,
                                "description": "SQL 执行后返回数据总量限制，单位是字节，-1表示不限制，原因是SQL执行后返回大量数据，可能导致大模型上下文token超限。系统默认为 5000。注意：此参数在 command 为 execute_sql 时有效，用于限制返回结果的数据大小",
                                "type": "integer"
                              },
                              "return_record_limit": {
                                "default": 100,
                                "description": "SQL 执行后返回数据条数限制，-1表示不限制，原因是SQL执行后返回大量数据，可能导致大模型上下文token超限。系统默认为 100。注意：此参数在 command 为 execute_sql 时有效，用于限制返回结果的数据条数",
                                "type": "integer"
                              },
                              "session_id": {
                                "description": "会话ID，用于标识和管理会话状态，同一会话ID可以共享历史数据和缓存",
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
                              },
                              "view_num_limit": {
                                "default": 5,
                                "description": "获取元数据时引用视图数量限制，-1表示不限制，原因是数据源包含大量视图，可能导致大模型上下文token超限，内置的召回算法会自动筛选最相关的视图。系统默认为 5。注意：此参数仅在 command 为 get_metadata 时有效，在 command 为 execute_sql 时无效，因为工具会严格执行 SQL，不会限制视图数量",
                                "type": "integer"
                              },
                              "with_sample": {
                                "default": true,
                                "description": "查询元数据时是否包含样例数据",
                                "type": "boolean"
                              }
                            },
                            "type": "object"
                          },
                          "data_source": {
                            "description": "数据源配置信息",
                            "properties": {
                              "account_type": {
                                "default": "user",
                                "description": "调用者的类型，user 代表普通用户，app 代表应用账号, anonymous 代表匿名用户",
                                "enum": [
                                  "user",
                                  "app",
                                  "anonymous"
                                ],
                                "type": "string"
                              },
                              "base_url": {
                                "description": "服务器地址，用于连接数据源服务",
                                "type": "string"
                              },
                              "kn": {
                                "description": "知识网络配置参数，用于从知识网络中获取数据源",
                                "items": {
                                  "properties": {
                                    "knowledge_network_id": {
                                      "description": "知识网络ID",
                                      "type": "string"
                                    },
                                    "object_types": {
                                      "description": "知识网络对象类型",
                                      "items": {
                                        "type": "string"
                                      },
                                      "type": "array"
                                    }
                                  },
                                  "required": [
                                    "knowledge_network_id"
                                  ],
                                  "type": "object"
                                },
                                "type": "array"
                              },
                              "recall_mode": {
                                "default": "keyword_vector_retrieval",
                                "description": "召回模式，支持 keyword_vector_retrieval(默认), agent_intent_planning, agent_intent_retrieval",
                                "enum": [
                                  "keyword_vector_retrieval",
                                  "agent_intent_planning",
                                  "agent_intent_retrieval"
                                ],
                                "type": "string"
                              },
                              "search_scope": {
                                "description": "知识网络搜索范围，支持 object_types, relation_types, action_types",
                                "items": {
                                  "type": "string"
                                },
                                "type": "array"
                              },
                              "token": {
                                "description": "认证令牌，如提供则无需用户名和密码",
                                "type": "string"
                              },
                              "user_id": {
                                "description": "用户ID",
                                "type": "string"
                              },
                              "view_list": {
                                "description": "逻辑视图ID列表",
                                "items": {
                                  "type": "string"
                                },
                                "type": "array"
                              }
                            },
                            "type": "object"
                          },
                          "sql": {
                            "description": "要执行的 SQL 语句，当 command 为 execute_sql 时必填",
                            "type": "string"
                          },
                          "timeout": {
                            "default": 120,
                            "description": "请求超时时间（秒），超过此时间未完成则返回超时错误，默认120秒",
                            "type": "number"
                          },
                          "title": {
                            "description": "数据的标题，获取元数据则必填",
                            "type": "string"
                          },
                          "with_sample": {
                            "default": true,
                            "description": "查询元数据时是否包含样例数据",
                            "type": "boolean"
                          }
                        },
                        "required": [
                          "data_source",
                          "command"
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
                        "example": {
                          "output": {
                            "command": "execute_sql",
                            "data": [
                              {
                                "column1": "value1",
                                "column2": "value2"
                              }
                            ],
                            "data_desc": {
                              "real_records_num": 1,
                              "return_records_num": 1
                            },
                            "message": "SQL 执行成功",
                            "result_cache_key": "RESULT_CACHE_KEY",
                            "sql": "SELECT * FROM table LIMIT 10"
                          },
                          "time": "14.328890085220337",
                          "tokens": "100"
                        },
                        "schema": {
                          "properties": {
                            "command": {
                              "description": "执行的命令类型",
                              "type": "string"
                            },
                            "data": {
                              "description": "查询结果数据",
                              "items": {
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "data_desc": {
                              "description": "数据描述信息",
                              "properties": {
                                "real_records_num": {
                                  "description": "实际记录数",
                                  "type": "integer"
                                },
                                "return_records_num": {
                                  "description": "返回记录数",
                                  "type": "integer"
                                }
                              },
                              "type": "object"
                            },
                            "message": {
                              "description": "执行结果消息",
                              "type": "string"
                            },
                            "metadata": {
                              "description": "元数据信息，当 command 为 get_metadata 时返回",
                              "type": "object"
                            },
                            "result_cache_key": {
                              "description": "结果缓存键，用于从缓存中获取完整查询结果，前端可通过此键获取完整数据",
                              "type": "string"
                            },
                            "sample": {
                              "description": "样例数据，当 command 为 get_metadata 且 with_sample 为 true 时返回",
                              "type": "object"
                            },
                            "sql": {
                              "description": "执行的SQL语句",
                              "type": "string"
                            },
                            "summary": {
                              "description": "数据源摘要信息，当 command 为 get_metadata 时返回",
                              "items": {
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "title": {
                              "description": "数据的标题",
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
            "create_time": 1776675263994095000,
            "update_time": 1776675263994095000,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "bc8378f5-ef31-4b0c-9cec-5526ad74a5b8",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "1c21376f-ba39-47de-bb57-24552fa6f6ef",
            "name": "text2sql",
            "description": "根据用户输入的文本和数据视图信息来生成 SQL 语句，并查询数据库。注意: input参数只接受问题，不接受SQL。工具具有更优秀的SQL生成能力，你只需要告诉工具需要查询的内容即可。有时用户只需要生成SQL，不需要查询，需要给出解释\n注意：为了节省 token 数，输出的结果可能不完整，这是正常情况。data_desc 对象来记录返回数据条数和实际结果条数",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "d85664eb-64cb-4f17-bf42-9495aeffc753",
              "summary": "text2sql",
              "description": "根据用户输入的文本和数据视图信息来生成 SQL 语句，并查询数据库。注意: input参数只接受问题，不接受SQL。工具具有更优秀的SQL生成能力，你只需要告诉工具需要查询的内容即可。有时用户只需要生成SQL，不需要查询，需要给出解释\n注意：为了节省 token 数，输出的结果可能不完整，这是正常情况。data_desc 对象来记录返回数据条数和实际结果条数",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/tools/text2sql",
              "method": "POST",
              "create_time": 1776675263984471000,
              "update_time": 1776675263984471000,
              "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "api_spec": {
                "parameters": [
                  {
                    "name": "stream",
                    "in": "query",
                    "description": "是否流式返回",
                    "required": false,
                    "schema": {
                      "default": false,
                      "type": "boolean"
                    }
                  },
                  {
                    "name": "mode",
                    "in": "query",
                    "description": "请求模式",
                    "required": false,
                    "schema": {
                      "default": "http",
                      "enum": [
                        "http",
                        "sse"
                      ],
                      "type": "string"
                    }
                  }
                ],
                "request_body": {
                  "description": "",
                  "content": {
                    "application/json": {
                      "example": {
                        "action": "gen_exec",
                        "config": {
                          "background": "",
                          "dimension_num_limit": 10,
                          "force_limit": 100,
                          "only_essential_dim": true,
                          "recall_mode": "keyword_vector_retrieval",
                          "retry_times": 3,
                          "return_data_limit": 1000,
                          "return_record_limit": 10,
                          "rewrite_query": false,
                          "session_id": "123",
                          "session_type": "in_memory",
                          "show_sql_graph": false,
                          "view_num_limit": 5
                        },
                        "data_source": {
                          "base_url": "https://xxxxx",
                          "kg": [
                            {
                              "fields": [
                                "regions",
                                "comments"
                              ],
                              "kg_id": "129"
                            }
                          ],
                          "kn_id": "",
                          "recall_mode": "keyword_vector_retrieval",
                          "search_scope": [
                            "object_types",
                            "relation_types",
                            "action_types"
                          ],
                          "token": "",
                          "user_id": "",
                          "view_list": [
                            "view_id"
                          ]
                        },
                        "infos": {
                          "extra_info": "",
                          "knowledge_enhanced_information": {}
                        },
                        "inner_llm": {
                          "frequency_penalty": 0,
                          "id": "1935601639213895680",
                          "max_tokens": 1000,
                          "name": "doubao-seed-1.6-flash",
                          "presence_penalty": 0,
                          "temperature": 1,
                          "top_k": 1,
                          "top_p": 1
                        },
                        "input": "去年的业绩",
                        "llm": {
                          "max_tokens": 4000,
                          "model_name": "Model Name",
                          "openai_api_base": "http://xxxx",
                          "openai_api_key": "******",
                          "temperature": 0.1
                        }
                      },
                      "schema": {
                        "properties": {
                          "action": {
                            "default": "gen_exec",
                            "description": "工具行为类型，其中gen表示只生成SQL，gen_exec表示生成并执行SQL，show_ds表示只展示数据源信息",
                            "enum": [
                              "gen",
                              "gen_exec",
                              "show_ds"
                            ],
                            "type": "string"
                          },
                          "config": {
                            "description": "工具配置参数",
                            "properties": {
                              "background": {
                                "description": "背景信息",
                                "type": "string"
                              },
                              "dimension_num_limit": {
                                "default": 30,
                                "description": "给大模型选择时维度数量限制，-1表示不限制, 系统默认为 30",
                                "type": "integer"
                              },
                              "force_limit": {
                                "default": 200,
                                "description": "生成的 SQL 的 LIMIT 子句限制，-1表示不限制, 系统默认为 200",
                                "type": "integer"
                              },
                              "only_essential_dim": {
                                "default": true,
                                "description": "在生成的结果解释说明中，是否只展示必要的维度",
                                "type": "boolean"
                              },
                              "retry_times": {
                                "default": 3,
                                "description": "重试次数",
                                "type": "integer"
                              },
                              "return_data_limit": {
                                "default": -1,
                                "description": "SQL 执行后返回数据总量限制，单位是字节，-1表示不限制，原因是SQL执行后返回大量数据，可能导致大模型上下文token超限",
                                "type": "integer"
                              },
                              "return_record_limit": {
                                "default": -1,
                                "description": "SQL 执行后返回数据条数限制，-1表示不限制，原因是SQL执行后返回大量数据，可能导致大模型上下文token超限",
                                "type": "integer"
                              },
                              "rewrite_query": {
                                "default": false,
                                "description": "是否重写用户输入的自然语言查询，即在生成 SQL 时，根据数据源的描述和样本数据，重写用户输入的自然语言查询，以更符合数据源的实际情况",
                                "type": "boolean"
                              },
                              "session_id": {
                                "description": "会话ID",
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
                              },
                              "view_num_limit": {
                                "default": 5,
                                "description": "给大模型选择时引用视图数量限制，-1表示不限制，原因是数据源包含大量视图，可能导致大模型上下文token超限，内置的召回算法会自动筛选最相关的视图",
                                "type": "integer"
                              }
                            },
                            "type": "object"
                          },
                          "data_source": {
                            "description": "视图配置信息",
                            "properties": {
                              "account_type": {
                                "default": "user",
                                "description": "调用者的类型，user 代表普通用户，app 代表应用账号，anonymous 代表匿名用户",
                                "enum": [
                                  "user",
                                  "app",
                                  "anonymous"
                                ],
                                "type": "string"
                              },
                              "base_url": {
                                "description": "服务器地址",
                                "type": "string"
                              },
                              "kn": {
                                "description": "知识网络配置参数",
                                "items": {
                                  "properties": {
                                    "knowledge_network_id": {
                                      "description": "知识网络ID",
                                      "type": "string"
                                    },
                                    "object_types": {
                                      "description": "知识网络对象类型",
                                      "items": {
                                        "type": "string"
                                      },
                                      "type": "array"
                                    }
                                  },
                                  "required": [
                                    "knowledge_network_id"
                                  ],
                                  "type": "object"
                                },
                                "type": "array"
                              },
                              "recall_mode": {
                                "default": "keyword_vector_retrieval",
                                "description": "召回模式，支持 keyword_vector_retrieval(默认), agent_intent_planning, agent_intent_retrieval",
                                "enum": [
                                  "keyword_vector_retrieval",
                                  "agent_intent_planning",
                                  "agent_intent_retrieval"
                                ],
                                "type": "string"
                              },
                              "search_scope": {
                                "description": "知识网络搜索范围，支持 object_types, relation_types, action_types",
                                "items": {
                                  "type": "string"
                                },
                                "type": "array"
                              },
                              "token": {
                                "description": "认证令牌",
                                "type": "string"
                              },
                              "user_id": {
                                "description": "用户ID",
                                "type": "string"
                              },
                              "view_list": {
                                "description": "逻辑视图ID列表",
                                "items": {
                                  "type": "string"
                                },
                                "type": "array"
                              }
                            },
                            "type": "object"
                          },
                          "infos": {
                            "description": "额外的输入信息, 包含额外信息和知识增强信息",
                            "properties": {
                              "extra_info": {
                                "description": "额外信息(非知识增强)",
                                "type": "string"
                              },
                              "knowledge_enhanced_information": {
                                "description": "知识增强信息",
                                "type": "object"
                              }
                            },
                            "type": "object"
                          },
                          "inner_llm": {
                            "description": "内部语言模型配置，用于指定内部使用的 LLM 模型参数，如模型ID、名称、温度、最大token数等。支持通过模型工厂配置模型",
                            "type": "object"
                          },
                          "input": {
                            "description": "用户输入的自然语言查询",
                            "type": "string"
                          },
                          "llm": {
                            "description": "语言模型配置",
                            "properties": {
                              "max_tokens": {
                                "description": "最大生成令牌数",
                                "type": "integer"
                              },
                              "model_name": {
                                "description": "模型名称",
                                "type": "string"
                              },
                              "openai_api_base": {
                                "description": "OpenAI API基础URL",
                                "type": "string"
                              },
                              "openai_api_key": {
                                "description": "OpenAI API密钥",
                                "type": "string"
                              },
                              "temperature": {
                                "description": "生成温度参数",
                                "type": "number"
                              }
                            },
                            "type": "object"
                          },
                          "timeout": {
                            "default": 120,
                            "description": "请求超时时间（秒），超过此时间未完成则返回超时错误，默认120秒",
                            "type": "number"
                          }
                        },
                        "required": [
                          "data_source",
                          "input",
                          "action"
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
                        "example": {
                          "output": {
                            "cites": [
                              {
                                "description": "XX 视图描述",
                                "id": "VIEW_ID",
                                "name": "XX 视图",
                                "type": "data_view"
                              }
                            ],
                            "data": [
                              {
                                "品牌": "XX 品牌",
                                "日期": "2024-01-01",
                                "销量": 200
                              }
                            ],
                            "data_desc": {
                              "real_records_num": 1,
                              "return_records_num": 1
                            },
                            "explanation": {
                              "XX 视图": [
                                {
                                  "指标": "XX 销量"
                                },
                                {
                                  "日期": "XX 日期范围"
                                },
                                {
                                  "品牌": "XX 品牌"
                                }
                              ]
                            },
                            "result_cache_key": "RESULT_CACHE_KEY",
                            "sql": "SELECT ... FROM ... WHERE ... LIMIT 100",
                            "title": "XX 标题"
                          },
                          "time": "14.328890085220337",
                          "tokens": "100"
                        },
                        "schema": {
                          "properties": {
                            "cites": {
                              "description": "引用的数据视图列表，包含视图ID、名称、类型和描述等信息",
                              "items": {
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "data": {
                              "description": "查询结果数据",
                              "items": {
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "data_desc": {
                              "description": "数据描述信息",
                              "properties": {
                                "real_records_num": {
                                  "description": "实际记录数",
                                  "type": "integer"
                                },
                                "return_records_num": {
                                  "description": "返回记录数",
                                  "type": "integer"
                                }
                              },
                              "type": "object"
                            },
                            "explanation": {
                              "description": "SQL解释说明，以字典形式展示查询条件、指标、维度等信息的业务含义",
                              "type": "object"
                            },
                            "result_cache_key": {
                              "description": "结果缓存键，用于从缓存中获取完整查询结果，前端可通过此键获取完整数据",
                              "type": "string"
                            },
                            "sql": {
                              "description": "生成的SQL语句，基于用户输入的自然语言查询自动生成",
                              "type": "string"
                            },
                            "title": {
                              "description": "查询标题",
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
            "create_time": 1776675263994095000,
            "update_time": 1776675263994095000,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "d85664eb-64cb-4f17-bf42-9495aeffc753",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "d2b31c8b-d352-4409-a587-94eff2a9629e",
            "name": "execute_code_legacy",
            "description": "在沙箱环境中执行 Python 代码，支持 pandas 等数据分析库，注意沙箱环境是受限环境，没有网络连接，不能使用 pip 安装第三方库。运行代码时，需要通过 print 输出结果，或者设置输出变量 output_params 参数，返回结果",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "69016685-37e2-4fd0-a4e9-907647672812",
              "summary": "execute_code_legacy",
              "description": "在沙箱环境中执行 Python 代码，支持 pandas 等数据分析库，注意沙箱环境是受限环境，没有网络连接，不能使用 pip 安装第三方库。运行代码时，需要通过 print 输出结果，或者设置输出变量 output_params 参数，返回结果",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/tools/execute_code",
              "method": "POST",
              "create_time": 1776675263984471000,
              "update_time": 1776675263984471000,
              "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "api_spec": {
                "parameters": [
                  {
                    "name": "stream",
                    "in": "query",
                    "description": "是否流式返回",
                    "required": false,
                    "schema": {
                      "default": false,
                      "type": "boolean"
                    }
                  },
                  {
                    "name": "mode",
                    "in": "query",
                    "description": "请求模式",
                    "required": false,
                    "schema": {
                      "default": "http",
                      "enum": [
                        "http",
                        "sse"
                      ],
                      "type": "string"
                    }
                  }
                ],
                "request_body": {
                  "description": "",
                  "content": {
                    "application/json": {
                      "examples": {
                        "basic_execution": {
                          "description": "执行简单的 Python 代码",
                          "summary": "基础代码执行",
                          "value": {
                            "content": "print('Hello World')\nx = 10\ny = 20\nresult = x + y\nprint(f'{x} + {y} = {result}')",
                            "filename": "hello.py",
                            "output_params": [
                              "result"
                            ],
                            "server_url": "http://localhost:8080",
                            "session_id": "test_session_123"
                          }
                        },
                        "data_analysis": {
                          "description": "使用 pandas 进行数据分析",
                          "summary": "数据分析示例",
                          "value": {
                            "content": "import pandas as pd\nimport numpy as np\n\n# 创建示例数据\ndata = {\n    'name': ['Alice', 'Bob', 'Charlie'],\n    'age': [25, 30, 35],\n    'salary': [50000, 60000, 70000]\n}\ndf = pd.DataFrame(data)\n\n# 计算统计信息\nstats = {\n    'mean_age': df['age'].mean(),\n    'mean_salary': df['salary'].mean(),\n    'total_records': len(df)\n}\n\nprint('数据统计:')\nfor key, value in stats.items():\n    print(f'{key}: {value}')\n\nresult = stats",
                            "filename": "data_analysis.py",
                            "output_params": [
                              "result",
                              "df"
                            ],
                            "server_url": "http://localhost:8080",
                            "session_id": "test_session_123"
                          }
                        }
                      },
                      "schema": {
                        "properties": {
                          "args": {
                            "description": "代码执行参数",
                            "items": {
                              "type": "string"
                            },
                            "type": "array"
                          },
                          "content": {
                            "description": "要执行的 Python 代码内容",
                            "type": "string"
                          },
                          "filename": {
                            "description": "文件名，用于指定代码文件的名称",
                            "type": "string"
                          },
                          "output_params": {
                            "description": "输出参数列表，用于指定要返回的变量名",
                            "items": {
                              "type": "string"
                            },
                            "type": "array"
                          },
                          "server_url": {
                            "default": "http://sandbox-control-plane:8000",
                            "description": "可选，沙箱服务器URL，默认使用配置文件中的 SANDBOX_URL",
                            "type": "string"
                          },
                          "session_id": {
                            "description": "沙箱会话ID",
                            "type": "string"
                          },
                          "timeout": {
                            "default": 120,
                            "description": "超时时间",
                            "type": "number"
                          },
                          "title": {
                            "description": "对于当前操作的简单描述，便于用户理解",
                            "type": "string"
                          }
                        },
                        "required": [
                          "content"
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
                            "message": {
                              "description": "操作状态消息",
                              "type": "string"
                            },
                            "result": {
                              "description": "操作结果, 包含标准输出、标准错误输出、返回值",
                              "type": "object"
                            }
                          },
                          "type": "object"
                        }
                      }
                    }
                  },
                  {
                    "status_code": "400",
                    "description": "Bad request",
                    "content": {
                      "application/json": {
                        "schema": {
                          "properties": {
                            "detail": {
                              "description": "详细错误信息",
                              "type": "string"
                            },
                            "error": {
                              "description": "错误信息",
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
            "create_time": 1776675263994095000,
            "update_time": 1776675263994095000,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "69016685-37e2-4fd0-a4e9-907647672812",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "c8173e76-5ffb-4b79-9e8a-c8ea65f77a66",
            "name": "knowledge_item",
            "description": "根据输入的文本，获取知识条目信息，知识条目可用于为其他工具提供背景知识",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "7459f9c6-2592-4cd2-ab8e-b393ebd4d0aa",
              "summary": "knowledge_item",
              "description": "根据输入的文本，获取知识条目信息，知识条目可用于为其他工具提供背景知识",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/tools/knowledge_item",
              "method": "POST",
              "create_time": 1776675263984471000,
              "update_time": 1776675263984471000,
              "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "api_spec": {
                "parameters": [
                  {
                    "name": "stream",
                    "in": "query",
                    "description": "是否流式返回",
                    "required": false,
                    "schema": {
                      "default": false,
                      "type": "boolean"
                    }
                  },
                  {
                    "name": "mode",
                    "in": "query",
                    "description": "请求模式",
                    "required": false,
                    "schema": {
                      "default": "http",
                      "enum": [
                        "http",
                        "sse"
                      ],
                      "type": "string"
                    }
                  }
                ],
                "request_body": {
                  "description": "",
                  "content": {
                    "application/json": {
                      "example": {
                        "data_source": {
                          "account_type": "user",
                          "base_url": "https://xxxxx",
                          "data_item_ids": [
                            "data_item_id"
                          ],
                          "token": "",
                          "user_id": ""
                        },
                        "input": "用户需要查询的文本"
                      },
                      "schema": {
                        "properties": {
                          "config": {
                            "description": "工具配置参数",
                            "properties": {
                              "knowledge_item_limit": {
                                "default": 5,
                                "description": "知识条目个数限制，-1 代表不限制，默认 5",
                                "type": "integer"
                              },
                              "return_data_limit": {
                                "default": -1,
                                "description": "每个知识条目返回数据总量限制，-1 代表不限制",
                                "type": "integer"
                              },
                              "return_record_limit": {
                                "default": 30,
                                "description": "每个知识条目返回数据条数限制，-1 代表不限制",
                                "type": "integer"
                              }
                            },
                            "type": "object"
                          },
                          "data_source": {
                            "description": "数据源配置信息",
                            "properties": {
                              "account_type": {
                                "default": "user",
                                "description": "用户类型",
                                "enum": [
                                  "user",
                                  "app",
                                  "anonymous"
                                ],
                                "type": "string"
                              },
                              "base_url": {
                                "description": "服务器地址",
                                "type": "string"
                              },
                              "data_item_ids": {
                                "description": "知识条目ID列表",
                                "items": {
                                  "type": "string"
                                },
                                "type": "array"
                              },
                              "token": {
                                "description": "认证令牌",
                                "type": "string"
                              },
                              "user_id": {
                                "description": "用户ID",
                                "type": "string"
                              }
                            },
                            "required": [
                              "data_item_ids"
                            ],
                            "type": "object"
                          },
                          "input": {
                            "description": "用户需要查询的文本",
                            "type": "string"
                          },
                          "timeout": {
                            "default": 30,
                            "description": "超时时间",
                            "type": "number"
                          }
                        },
                        "required": [
                          "data_source"
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
                        "example": {
                          "output": [
                            {
                              "comment": "知识条目描述",
                              "data_summary": {
                                "real_data_num": 10,
                                "return_data_num": 2
                              },
                              "items": {
                                "key1": "value1",
                                "key2": "value2"
                              },
                              "name": "知识条目名称",
                              "type": "kv_dict"
                            },
                            {
                              "comment": "知识条目描述",
                              "data_summary": {
                                "real_data_num": 5,
                                "return_data_num": 1
                              },
                              "items": [
                                {
                                  "comment": "知识条目描述",
                                  "key": "知识条目名称",
                                  "value": "知识条目值"
                                }
                              ],
                              "name": "列表类型知识条目",
                              "type": "list"
                            }
                          ],
                          "time": "14.328890085220337",
                          "tokens": "100"
                        },
                        "schema": {
                          "properties": {
                            "output": {
                              "items": {
                                "properties": {
                                  "comment": {
                                    "description": "知识条目描述",
                                    "type": "string"
                                  },
                                  "data_summary": {
                                    "properties": {
                                      "real_data_num": {
                                        "description": "实际数据条数",
                                        "type": "integer"
                                      },
                                      "return_data_num": {
                                        "description": "返回数据条数",
                                        "type": "integer"
                                      }
                                    },
                                    "type": "object"
                                  },
                                  "items": {
                                    "oneOf": [
                                      {
                                        "additionalProperties": {
                                          "type": "string"
                                        },
                                        "description": "键值对类型知识条目",
                                        "type": "object"
                                      },
                                      {
                                        "description": "列表类型知识条目",
                                        "items": {
                                          "properties": {
                                            "comment": {
                                              "description": "知识条目描述",
                                              "type": "string"
                                            },
                                            "key": {
                                              "description": "知识条目键",
                                              "type": "string"
                                            },
                                            "value": {
                                              "description": "知识条目值",
                                              "type": "string"
                                            }
                                          },
                                          "type": "object"
                                        },
                                        "type": "array"
                                      }
                                    ]
                                  },
                                  "name": {
                                    "description": "知识条目名称",
                                    "type": "string"
                                  },
                                  "type": {
                                    "description": "知识条目类型",
                                    "type": "string"
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
            "create_time": 1776675263994095000,
            "update_time": 1776675263994095000,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "7459f9c6-2592-4cd2-ab8e-b393ebd4d0aa",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "ef9b7971-e10c-46ba-bcf4-5252eac74b53",
            "name": "list_files_legacy",
            "description": "列出沙箱环境中的所有文件和目录",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "671ca769-6e7a-4e56-8975-cbe533b61eb6",
              "summary": "list_files_legacy",
              "description": "列出沙箱环境中的所有文件和目录",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/tools/list_files",
              "method": "POST",
              "create_time": 1776675263984471000,
              "update_time": 1776675263984471000,
              "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "api_spec": {
                "parameters": [
                  {
                    "name": "stream",
                    "in": "query",
                    "description": "是否流式返回",
                    "required": false,
                    "schema": {
                      "default": false,
                      "type": "boolean"
                    }
                  },
                  {
                    "name": "mode",
                    "in": "query",
                    "description": "请求模式",
                    "required": false,
                    "schema": {
                      "default": "http",
                      "enum": [
                        "http",
                        "sse"
                      ],
                      "type": "string"
                    }
                  }
                ],
                "request_body": {
                  "description": "",
                  "content": {
                    "application/json": {
                      "examples": {
                        "list_all_files": {
                          "description": "列出沙箱环境中的所有文件和目录",
                          "summary": "列出所有文件",
                          "value": {
                            "server_url": "http://localhost:8080",
                            "session_id": "test_session_123"
                          }
                        }
                      },
                      "schema": {
                        "properties": {
                          "server_url": {
                            "default": "http://sandbox-control-plane:8000",
                            "description": "可选，沙箱服务器URL，默认使用配置文件中的 SANDBOX_URL",
                            "type": "string"
                          },
                          "session_id": {
                            "description": "沙箱会话ID",
                            "type": "string"
                          },
                          "timeout": {
                            "default": 120,
                            "description": "超时时间",
                            "type": "number"
                          },
                          "title": {
                            "description": "对于当前操作的简单描述，便于用户理解",
                            "type": "string"
                          }
                        },
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
                            "message": {
                              "description": "操作状态消息",
                              "type": "string"
                            },
                            "result": {
                              "description": "操作结果, 包含标准输出、标准错误输出、返回值",
                              "type": "object"
                            }
                          },
                          "type": "object"
                        }
                      }
                    }
                  },
                  {
                    "status_code": "400",
                    "description": "Bad request",
                    "content": {
                      "application/json": {
                        "schema": {
                          "properties": {
                            "detail": {
                              "description": "详细错误信息",
                              "type": "string"
                            },
                            "error": {
                              "description": "错误信息",
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
            "create_time": 1776675263994095000,
            "update_time": 1776675263994095000,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "671ca769-6e7a-4e56-8975-cbe533b61eb6",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "6bddfdb4-2fa4-44e2-8a49-dfc54c74c721",
            "name": "read_file_legacy",
            "description": "读取沙箱环境中的文件内容，支持文本文件和二进制文件",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "e9eaaba0-999f-4f1f-859b-08484a2d334b",
              "summary": "read_file_legacy",
              "description": "读取沙箱环境中的文件内容，支持文本文件和二进制文件",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/tools/read_file",
              "method": "POST",
              "create_time": 1776675263984471000,
              "update_time": 1776675263984471000,
              "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "api_spec": {
                "parameters": [
                  {
                    "name": "stream",
                    "in": "query",
                    "description": "是否流式返回",
                    "required": false,
                    "schema": {
                      "default": false,
                      "type": "boolean"
                    }
                  },
                  {
                    "name": "mode",
                    "in": "query",
                    "description": "请求模式",
                    "required": false,
                    "schema": {
                      "default": "http",
                      "enum": [
                        "http",
                        "sse"
                      ],
                      "type": "string"
                    }
                  }
                ],
                "request_body": {
                  "description": "",
                  "content": {
                    "application/json": {
                      "examples": {
                        "read_python_file": {
                          "description": "读取 Python 源代码文件",
                          "summary": "读取 Python 文件",
                          "value": {
                            "filename": "hello.py",
                            "server_url": "http://localhost:8080",
                            "session_id": "test_session_123"
                          }
                        }
                      },
                      "schema": {
                        "properties": {
                          "filename": {
                            "description": "要读取的文件名",
                            "type": "string"
                          },
                          "server_url": {
                            "default": "http://sandbox-control-plane:8000",
                            "description": "可选，沙箱服务器URL，默认使用配置文件中的 SANDBOX_URL",
                            "type": "string"
                          },
                          "session_id": {
                            "description": "沙箱会话ID",
                            "type": "string"
                          },
                          "session_type": {
                            "description": "会话类型, 可选值为: redis, in_memory, 默认值为 redis",
                            "type": "string"
                          },
                          "timeout": {
                            "default": 120,
                            "description": "超时时间",
                            "type": "number"
                          },
                          "title": {
                            "description": "对于当前操作的简单描述，便于用户理解",
                            "type": "string"
                          }
                        },
                        "required": [
                          "filename"
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
                            "message": {
                              "description": "操作状态消息",
                              "type": "string"
                            },
                            "result": {
                              "description": "操作结果, 包含标准输出、标准错误输出、返回值",
                              "type": "object"
                            }
                          },
                          "type": "object"
                        }
                      }
                    }
                  },
                  {
                    "status_code": "400",
                    "description": "Bad request",
                    "content": {
                      "application/json": {
                        "schema": {
                          "properties": {
                            "detail": {
                              "description": "详细错误信息",
                              "type": "string"
                            },
                            "error": {
                              "description": "错误信息",
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
            "create_time": 1776675263994095000,
            "update_time": 1776675263994095000,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "e9eaaba0-999f-4f1f-859b-08484a2d334b",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "2d81078f-b3f4-4e09-9bcb-808a68d48df1",
            "name": "text2metric",
            "description": "根据文本生成指标查询参数, 并查询指标数据",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "1eeede75-57c6-4ed4-a0e3-246c311bac05",
              "summary": "text2metric",
              "description": "根据文本生成指标查询参数, 并查询指标数据",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/tools/text2metric",
              "method": "POST",
              "create_time": 1776675263984471000,
              "update_time": 1776675263984471000,
              "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "api_spec": {
                "parameters": [
                  {
                    "name": "stream",
                    "in": "query",
                    "description": "是否流式返回",
                    "required": false,
                    "schema": {
                      "default": false,
                      "type": "boolean"
                    }
                  },
                  {
                    "name": "mode",
                    "in": "query",
                    "description": "请求模式",
                    "required": false,
                    "schema": {
                      "default": "http",
                      "enum": [
                        "http",
                        "sse"
                      ],
                      "type": "string"
                    }
                  }
                ],
                "request_body": {
                  "description": "",
                  "content": {
                    "application/json": {
                      "schema": {
                        "properties": {
                          "action": {
                            "default": "query",
                            "description": "操作类型：show_ds 显示数据源信息，query 执行查询（默认）",
                            "enum": [
                              "show_ds",
                              "query"
                            ],
                            "type": "string"
                          },
                          "config": {
                            "description": "工具配置参数",
                            "properties": {
                              "background": {
                                "description": "背景信息",
                                "type": "string"
                              },
                              "dimension_num_limit": {
                                "default": 30,
                                "description": "给大模型选择时维度数量限制，-1表示不限制, 系统默认为 30",
                                "type": "integer"
                              },
                              "force_limit": {
                                "default": 1000,
                                "description": "查询指标时，如果没有设置返回数据条数限制，在采用该参数设置的值作为限制, -1表示不限制, 系统默认为 1000",
                                "type": "integer"
                              },
                              "recall_top_k": {
                                "default": 5,
                                "description": "指标召回数量限制，用于限制从数据源中召回的指标数量，-1表示不限制, 系统默认为 5",
                                "type": "integer"
                              },
                              "return_data_limit": {
                                "default": 5000,
                                "description": "结果返回时数据总量限制，单位是字节，-1表示不限制, 原因是指标查询执行后返回大量数据，可能导致大模型上下文token超限。系统默认为 5000",
                                "type": "integer"
                              },
                              "return_record_limit": {
                                "default": 100,
                                "description": "结果返回时数据条数限制，-1表示不限制, 原因是指标查询执行后返回大量数据，可能导致大模型上下文token超限。系统默认为 100",
                                "type": "integer"
                              },
                              "session_id": {
                                "description": "会话ID",
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
                          "data_source": {
                            "description": "数据源配置信息",
                            "properties": {
                              "account_type": {
                                "default": "user",
                                "description": "调用者的类型，user 代表普通用户，app 代表应用账号，anonymous 代表匿名用户",
                                "enum": [
                                  "user",
                                  "app",
                                  "anonymous"
                                ],
                                "type": "string"
                              },
                              "base_url": {
                                "description": "服务器地址",
                                "type": "string"
                              },
                              "kn": {
                                "description": "知识网络配置参数",
                                "items": {
                                  "properties": {
                                    "knowledge_network_id": {
                                      "description": "知识网络ID",
                                      "type": "string"
                                    },
                                    "object_types": {
                                      "description": "知识网络对象类型",
                                      "items": {
                                        "type": "string"
                                      },
                                      "type": "array"
                                    }
                                  },
                                  "required": [
                                    "knowledge_network_id"
                                  ],
                                  "type": "object"
                                },
                                "type": "array"
                              },
                              "metric_list": {
                                "description": "指标ID列表",
                                "items": {
                                  "type": "string"
                                },
                                "type": "array"
                              },
                              "recall_mode": {
                                "default": "keyword_vector_retrieval",
                                "description": "召回模式，支持 keyword_vector_retrieval(默认), agent_intent_planning, agent_intent_retrieval",
                                "enum": [
                                  "keyword_vector_retrieval",
                                  "agent_intent_planning",
                                  "agent_intent_retrieval"
                                ],
                                "type": "string"
                              },
                              "search_scope": {
                                "description": "知识网络搜索范围，支持 object_types, relation_types, action_types",
                                "items": {
                                  "type": "string"
                                },
                                "type": "array"
                              },
                              "token": {
                                "description": "认证令牌",
                                "type": "string"
                              },
                              "user_id": {
                                "description": "用户ID",
                                "type": "string"
                              }
                            },
                            "type": "object"
                          },
                          "infos": {
                            "description": "额外的输入信息, 包含额外信息和知识增强信息",
                            "properties": {
                              "extra_info": {
                                "description": "额外信息(非知识增强)",
                                "type": "string"
                              },
                              "knowledge_enhanced_information": {
                                "description": "知识增强信息",
                                "type": "object"
                              }
                            },
                            "type": "object"
                          },
                          "inner_llm": {
                            "description": "内部语言模型配置，用于指定内部使用的 LLM 模型参数，如模型ID、名称、温度、最大token数等。支持通过模型工厂配置模型",
                            "type": "object"
                          },
                          "input": {
                            "description": "用户输入的自然语言查询",
                            "type": "string"
                          },
                          "llm": {
                            "description": "外部大语言模型配置，一般不需要配置，除非需要使用外部模型",
                            "properties": {
                              "max_tokens": {
                                "description": "最大生成令牌数",
                                "type": "integer"
                              },
                              "model_name": {
                                "description": "模型名称",
                                "type": "string"
                              },
                              "openai_api_base": {
                                "description": "OpenAI API基础URL",
                                "type": "string"
                              },
                              "openai_api_key": {
                                "description": "OpenAI API密钥",
                                "type": "string"
                              },
                              "temperature": {
                                "description": "生成温度参数",
                                "type": "number"
                              }
                            },
                            "type": "object"
                          },
                          "timeout": {
                            "default": 120,
                            "description": "请求超时时间（秒），超过此时间未完成则返回超时错误，默认120秒",
                            "type": "number"
                          }
                        },
                        "required": [
                          "data_source",
                          "input"
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
                        "example": {
                          "output": {
                            "cites": [
                              {
                                "description": "CPU使用率指标",
                                "id": "cpu_usage_metric",
                                "name": "CPU使用率",
                                "type": "metric"
                              }
                            ],
                            "data": [
                              {
                                "CPU使用率": 75.5,
                                "主机": "server-1",
                                "时间": "2024-01-01 10:00:00"
                              },
                              {
                                "CPU使用率": 78.2,
                                "主机": "server-1",
                                "时间": "2024-01-01 10:01:00"
                              }
                            ],
                            "data_desc": {
                              "real_records_num": 120,
                              "return_records_num": 2
                            },
                            "execution_result": {
                              "data_summary": {
                                "is_calendar": false,
                                "is_variable": false,
                                "step": "1m",
                                "total_data_points": 120
                              },
                              "model_info": {
                                "id": "cpu_usage_metric",
                                "metric_type": "atomic",
                                "name": "CPU使用率",
                                "query_type": "dsl",
                                "unit": "%"
                              },
                              "sample_data": [
                                {
                                  "index": 1,
                                  "labels": {
                                    "host": "server-1"
                                  },
                                  "sample_times": [
                                    1646360670123,
                                    1646360730123
                                  ],
                                  "sample_values": [
                                    75.5,
                                    78.2
                                  ],
                                  "time_points": 120,
                                  "value_points": 120
                                }
                              ],
                              "success": true
                            },
                            "explanation": {
                              "CPU使用率": [
                                {
                                  "指标": "使用 'CPU使用率' 指标，按 '时间' '最近1小时' 的数据，并设置过滤条件 '主机为server-1和server-2'"
                                },
                                {
                                  "时间": "从 2024-01-01 到 2024-01-02"
                                },
                                {
                                  "主机": "包含 server-1, server-2"
                                }
                              ]
                            },
                            "metric_id": "cpu_usage_metric",
                            "query_params": {
                              "end": 1646471470123,
                              "filters": [
                                {
                                  "name": "labels.host",
                                  "operation": "in",
                                  "value": [
                                    "server-1",
                                    "server-2"
                                  ]
                                }
                              ],
                              "instant": false,
                              "start": 1646360670123,
                              "step": "1m"
                            },
                            "result_cache_key": "cpu_usage_metric_1646360670123_1646471470123",
                            "title": "最近1小时CPU使用率"
                          },
                          "time": "2.5",
                          "tokens": "150"
                        },
                        "schema": {
                          "properties": {
                            "cites": {
                              "description": "引用的指标列表，包含指标ID、名称、类型等信息",
                              "items": {
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "data": {
                              "description": "查询结果数据",
                              "items": {
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "data_desc": {
                              "description": "数据描述信息",
                              "properties": {
                                "real_records_num": {
                                  "description": "实际记录数",
                                  "type": "integer"
                                },
                                "return_records_num": {
                                  "description": "返回记录数",
                                  "type": "integer"
                                }
                              },
                              "type": "object"
                            },
                            "execution_result": {
                              "description": "指标执行结果详情，包含指标元信息、数据摘要、样例数据等",
                              "type": "object"
                            },
                            "explanation": {
                              "description": "查询解释说明，以字典形式展示指标选择、时间范围、过滤条件等信息的业务含义",
                              "type": "object"
                            },
                            "metric_id": {
                              "description": "选择的指标ID，基于用户输入自动匹配并选择的指标标识符",
                              "type": "string"
                            },
                            "query_params": {
                              "description": "生成的查询参数，包含时间范围、过滤条件、步长等指标查询所需的参数",
                              "type": "object"
                            },
                            "result_cache_key": {
                              "description": "结果缓存键，用于从缓存中获取完整查询结果，前端可通过此键获取完整数据",
                              "type": "string"
                            },
                            "title": {
                              "description": "查询标题",
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
            "create_time": 1776675263994095000,
            "update_time": 1776675263994095000,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "1eeede75-57c6-4ed4-a0e3-246c311bac05",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "855c5896-c241-4387-995f-506c7b789715",
            "name": "kn_select",
            "description": "知识网络选择工具。根据用户问题或表在候选知识网络中匹配；可提供 kn_ids 限定候选（不调用列表接口），否则拉取全量列表",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "677ad022-bc7e-46df-9cd0-909133d14db5",
              "summary": "kn_select",
              "description": "知识网络选择工具。根据用户问题或表在候选知识网络中匹配；可提供 kn_ids 限定候选（不调用列表接口），否则拉取全量列表",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/tools/kn_select",
              "method": "POST",
              "create_time": 1776675263984471000,
              "update_time": 1776675263984471000,
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
                              "base_url": {
                                "description": "AF 服务基础 URL（可选，覆盖默认服务地址）",
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
                          "force_refresh_cache": {
                            "default": false,
                            "description": "是否强制刷新缓存（可选，默认为false）",
                            "type": "boolean"
                          },
                          "kn_ids": {
                            "description": "候选知识网络ID列表（可选）。非空时不请求知识网络列表接口，仅在这些ID中做表/问题匹配",
                            "items": {
                              "description": "知识网络 ID（字符串或与 JSON 数字兼容的整型）",
                              "oneOf": [
                                {
                                  "type": "string"
                                },
                                {
                                  "type": "integer"
                                }
                              ]
                            },
                            "type": "array"
                          },
                          "llm": {
                            "description": "LLM 配置参数（可选）",
                            "type": "object"
                          },
                          "query": {
                            "description": "用户输入的问题（可选，如果提供了tables则优先使用表匹配）",
                            "type": "string"
                          },
                          "tables": {
                            "description": "表信息列表（可选）",
                            "items": {
                              "properties": {
                                "business_name": {
                                  "description": "视图的业务名称",
                                  "type": "string"
                                },
                                "id": {
                                  "description": "视图的id",
                                  "type": "string"
                                },
                                "technical_name": {
                                  "description": "视图的技术名称",
                                  "type": "string"
                                },
                                "uuid": {
                                  "description": "视图的uuid",
                                  "type": "string"
                                }
                              },
                              "required": [
                                "id",
                                "uuid",
                                "business_name",
                                "technical_name"
                              ],
                              "type": "object"
                            },
                            "type": "array"
                          }
                        },
                        "type": "object"
                      }
                    }
                  },
                  "required": false
                },
                "responses": [
                  {
                    "status_code": "200",
                    "description": "Successful operation；HTTP 层经 api_tool_decorator/make_json_response 包装为 { result }",
                    "content": {
                      "application/json": {
                        "schema": {
                          "properties": {
                            "result": {
                              "description": "工具业务输出：匹配到的知识网络列表；无匹配时为含空 kn_id 的单元素数组",
                              "items": {
                                "properties": {
                                  "kn_id": {
                                    "description": "知识网络ID",
                                    "type": "string"
                                  },
                                  "kn_name": {
                                    "description": "知识网络名称（仅 kn_ids 模式可能为空）",
                                    "type": "string"
                                  }
                                },
                                "required": [
                                  "kn_id",
                                  "kn_name"
                                ],
                                "type": "object"
                              },
                              "type": "array"
                            }
                          },
                          "required": [
                            "result"
                          ],
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
            "create_time": 1776675263994095000,
            "update_time": 1776675263994095000,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "677ad022-bc7e-46df-9cd0-909133d14db5",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          }
        ],
        "create_time": 1776675263982936300,
        "update_time": 1776675322588571000,
        "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
        "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
        "metadata_type": "openapi"
      }
    ]
  }
}