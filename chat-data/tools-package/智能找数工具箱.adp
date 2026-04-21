{
  "operator": {
    "configs": [
      {
        "operator_id": "434d3e1d-a57c-4a0b-bc22-e8db8876fa18",
        "operator_name": "视图探查报告",
        "version": "fe1381ba-e06e-4ed9-b1c9-c3782b6a1926",
        "status": "editing",
        "metadata_type": "openapi",
        "metadata": {
          "version": "fe1381ba-e06e-4ed9-b1c9-c3782b6a1926",
          "summary": "data_view_explore_tool",
          "description": "1、该工具是查询视图的探查报告，所以该工具在其他工具调用之后使用，而且是包含视图id的结果，因为要使用视图ID查询报告\r\n2、如果调用其他工具的结果中包含formview_uuid，那么该formview_uuid就是视图ID\r\n3、如果调用其他工具的结果中包含datacatalogid且resource_type=1，那么同层的resource_id就是视图ID\r\n4、视图有可能没有探查报告，这很正常",
          "server_url": "http://af-sailor-agent:9595",
          "path": "/api/af-sailor-agent/v1/assistant/tools/data_view_explore",
          "method": "POST",
          "create_time": 1776675288761209900,
          "update_time": 1776675288761209900,
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
                            "type": "string"
                          },
                          "password": {
                            "type": "string"
                          },
                          "token": {
                            "type": "string"
                          },
                          "user": {
                            "type": "string"
                          },
                          "user_id": {
                            "type": "string"
                          }
                        },
                        "type": "object"
                      },
                      "config": {
                        "description": "工具配置参数",
                        "properties": {
                          "background": {
                            "description": "背景信息（可选，不影响结果）",
                            "type": "string"
                          },
                          "base_url": {
                            "description": "AF 数据视图服务基础 URL（可选）",
                            "type": "string"
                          },
                          "session_type": {
                            "default": "redis",
                            "description": "会话类型，目前仅占位",
                            "enum": [
                              "in_memory",
                              "redis"
                            ],
                            "type": "string"
                          }
                        },
                        "type": "object"
                      },
                      "ids": {
                        "description": "数据视图 ID 列表（form_view_id / entity_id 列表）",
                        "items": {
                          "type": "string"
                        },
                        "type": "array"
                      },
                      "llm": {
                        "description": "LLM 配置参数（本工具不会真正使用，仅保持接口一致）",
                        "type": "object"
                      }
                    },
                    "required": [
                      "ids"
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
                      "description": "批量探查结果，结构与 AF 数据视图服务 `explore-report/batch` 返回体一致。",
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
        "operator_info": {
          "operator_type": "basic",
          "execution_mode": "sync",
          "category": "other_category",
          "source": "unknown",
          "is_data_source": false
        },
        "operator_execute_control": {
          "timeout": 3000,
          "retry_policy": {
            "max_attempts": 3,
            "initial_delay": 1000,
            "backoff_factor": 2,
            "max_delay": 6000,
            "retry_conditions": {
              "status_code": null,
              "error_codes": null
            }
          }
        },
        "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
        "create_time": 1776675288760772400,
        "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
        "update_time": 1776675288760772400,
        "is_internal": false
      }
    ],
    "composite_configs": null
  },
  "toolbox": {
    "configs": [
      {
        "box_id": "7f302d4c-4225-428c-a854-0b2e32dcbbb9",
        "box_name": "智能找数工具箱",
        "box_desc": "智能找数工具箱",
        "box_svc_url": "http://sailor-agent:9595",
        "status": "published",
        "category_type": "other_category",
        "category_name": "未分类",
        "is_internal": false,
        "source": "custom",
        "tools": [
          {
            "tool_id": "5d4357aa-18b7-45b8-8dd0-3d4d31c4e9ef",
            "name": "af_sailor",
            "description": "这是一个数据搜索工具：工具可以对问题进行数据资源元数据搜索，并返回搜索结果",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "70d85141-046b-4124-b0de-3e4308c882f2",
              "summary": "af_sailor",
              "description": "这是一个数据搜索工具：工具可以对问题进行数据资源元数据搜索，并返回搜索结果",
              "server_url": "http://af-sailor-agent:9595",
              "path": "/api/af-sailor-agent/v1/assistant/tools/af_sailor",
              "method": "POST",
              "create_time": 1776675288754724000,
              "update_time": 1776675288754724000,
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
                          "config": {
                            "description": "工具配置参数",
                            "properties": {
                              "direct_qa": {
                                "description": "背景信息",
                                "type": "string"
                              },
                              "session_id": {
                                "description": "会话ID",
                                "type": "string"
                              },
                              "session_type": {
                                "default": "in_memory",
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
                          "input": {
                            "description": "输入参数",
                            "properties": {
                              "extraneous_information": {
                                "default": "",
                                "description": "用户在多轮对话中重复强调的信息",
                                "type": "string"
                              },
                              "question": {
                                "description": "自然语言问题或者自然语言表述",
                                "type": "string"
                              }
                            },
                            "required": [
                              "question"
                            ],
                            "type": "object"
                          },
                          "resources": {
                            "description": "资源配置信息",
                            "properties": {
                              "auth_url": {
                                "description": "认证服务URL",
                                "type": "string"
                              },
                              "parameters": {
                                "description": "资源配置信息",
                                "type": "object"
                              },
                              "password": {
                                "description": "密码",
                                "type": "string"
                              },
                              "token": {
                                "description": "认证令牌，如提供则无需用户名和密码",
                                "type": "string"
                              },
                              "user": {
                                "description": "用户名",
                                "type": "string"
                              }
                            },
                            "required": [
                              "parameters"
                            ],
                            "type": "object"
                          }
                        },
                        "required": [
                          "resources",
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
                        "schema": {
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
            "create_time": 1776675288756439800,
            "update_time": 1776675288756439800,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "70d85141-046b-4124-b0de-3e4308c882f2",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "13fb3f64-d942-4f3b-b59b-6f8c620ab28a",
            "name": "datasource_filter",
            "description": "数据资源过滤工具，如果用户针对上一轮问答的结果做进一步追问的时候，可以使用该工具",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "e30c0e1c-d1b7-4973-b364-7a37e1952657",
              "summary": "datasource_filter",
              "description": "数据资源过滤工具，如果用户针对上一轮问答的结果做进一步追问的时候，可以使用该工具",
              "server_url": "http://af-sailor-agent:9595",
              "path": "/api/af-sailor-agent/v1/assistant/tools/datasource_filter",
              "method": "POST",
              "create_time": 1776675288754724000,
              "update_time": 1776675288754724000,
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
                                "type": "string"
                              },
                              "password": {
                                "type": "string"
                              },
                              "token": {
                                "type": "string"
                              },
                              "user": {
                                "type": "string"
                              },
                              "user_id": {
                                "type": "string"
                              }
                            },
                            "type": "object"
                          },
                          "config": {
                            "description": "工具配置参数",
                            "properties": {
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
                          "llm": {
                            "description": "LLM 配置参数",
                            "type": "object"
                          },
                          "query": {
                            "description": "用户查询",
                            "type": "string"
                          },
                          "search_tool_cache_key": {
                            "description": "search 工具结果的缓存 key",
                            "type": "string"
                          }
                        },
                        "required": [
                          "query",
                          "search_tool_cache_key"
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
            "create_time": 1776675288756439800,
            "update_time": 1776675288756439800,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "e30c0e1c-d1b7-4973-b364-7a37e1952657",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "ca59cea6-2e65-4b57-a49d-c85310fd6ebc",
            "name": "data_view_explore_tool",
            "description": "根据数据视图 ID 列表调用 AF 批量数据视图探查接口，返回探查结果。",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": null,
            "use_rule": "",
            "global_parameters": {
              "name": "",
              "description": "",
              "required": false,
              "in": "",
              "type": "",
              "value": null
            },
            "create_time": 1776675288756439800,
            "update_time": 1776675288756439800,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "operator",
            "source_id": "434d3e1d-a57c-4a0b-bc22-e8db8876fa18",
            "source_type": "operator",
            "script_type": "",
            "code": "",
            "dependencies": null,
            "dependencies_url": ""
          },
          {
            "tool_id": "4041e920-7dc4-44fa-ad9b-fccaa3f3e0c2",
            "name": "department_duty_query",
            "description": "查询部门职责（department duty）信息，支持通过 kn_id 指定知识网络。",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "78131f52-1bdc-4b92-a5c1-82840759c5eb",
              "summary": "department_duty_query",
              "description": "查询部门职责（department duty）信息，支持通过 kn_id 指定知识网络。",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/tools/department_duty_query",
              "method": "POST",
              "create_time": 1776675288754724000,
              "update_time": 1776675288754724000,
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
                                "type": "string"
                              },
                              "password": {
                                "type": "string"
                              },
                              "token": {
                                "type": "string"
                              },
                              "user": {
                                "type": "string"
                              },
                              "user_id": {
                                "type": "string"
                              }
                            },
                            "type": "object"
                          },
                          "config": {
                            "description": "工具配置参数",
                            "properties": {
                              "background": {
                                "description": "背景信息（可选，不影响结果）",
                                "type": "string"
                              },
                              "base_url": {
                                "description": "AF 服务基础 URL（可选）",
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
                          "kn_id": {
                            "default": "duty",
                            "description": "知识网络ID（kn_id），默认 duty",
                            "type": "string"
                          },
                          "llm": {
                            "description": "LLM 配置参数（本工具不会真正使用，仅保持接口一致）",
                            "type": "object"
                          },
                          "query": {
                            "description": "用户的完整查询需求，用于理解查询上下文",
                            "type": "string"
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
                            "relevant_duties": {
                              "description": "相关的三定职责列表",
                              "items": {
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "result_cache_key": {
                              "description": "结果缓存 key",
                              "type": "string"
                            },
                            "summary": {
                              "description": "统计信息",
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
            "create_time": 1776675288756439800,
            "update_time": 1776675288756439800,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "78131f52-1bdc-4b92-a5c1-82840759c5eb",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "83ce77aa-85d2-4ad3-9a48-f36291370015",
            "name": "datasource_rerank",
            "description": "数据资源重排序工具，用于对粗召回的数据资源进行筛选和重排序，选择最符合用户输入的资源",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "34f5152a-100c-4d02-99f1-986831484764",
              "summary": "datasource_rerank",
              "description": "数据资源重排序工具，用于对粗召回的数据资源进行筛选和重排序，选择最符合用户输入的资源",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/tools/datasource_rerank",
              "method": "POST",
              "create_time": 1776675288754724000,
              "update_time": 1776675288754724000,
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
                                "type": "string"
                              },
                              "password": {
                                "type": "string"
                              },
                              "token": {
                                "type": "string"
                              },
                              "user": {
                                "type": "string"
                              },
                              "user_id": {
                                "type": "string"
                              }
                            },
                            "type": "object"
                          },
                          "config": {
                            "description": "工具配置参数",
                            "type": "object"
                          },
                          "custom_rule_strategy_cache_key": {
                            "description": "可选，自定义规则策略查询结果的缓存key，用于提供自定义规则策略相关的背景信息",
                            "type": "string"
                          },
                          "data_source_list": {
                            "description": "粗召回的数据资源列表",
                            "items": {
                              "properties": {
                                "id": {
                                  "description": "数据资源的 id。 如果数据资源类型是form_view, 那么id格式是uuid, 如果数据资源类型是datacatalog, 那么id格式是雪花id",
                                  "type": "string"
                                },
                                "type": {
                                  "description": "数据资源的类型，如 'form_view' 或 'datacatalog'",
                                  "type": "string"
                                }
                              },
                              "required": [
                                "id",
                                "type"
                              ],
                              "type": "object"
                            },
                            "type": "array"
                          },
                          "department_duty_cache_key": {
                            "description": "可选，部门职责查询结果的缓存key，用于提供部门职责相关的背景信息",
                            "type": "string"
                          },
                          "llm": {
                            "description": "LLM 配置参数",
                            "type": "object"
                          },
                          "query": {
                            "description": "用户查询",
                            "type": "string"
                          },
                          "use_department_duty": {
                            "description": "可选，是否使用部门职责，默认为False。如果为True，会根据部门职责信息对数据资源进行匹配和评分",
                            "type": "boolean"
                          },
                          "use_priority_strategy": {
                            "description": "可选，是否使用优先搜索策略，默认为False。如果为True，会根据自定义规则策略中的优先推荐表ID进行排序",
                            "type": "boolean"
                          }
                        },
                        "required": [
                          "query",
                          "data_source_list"
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
            "create_time": 1776675288756439800,
            "update_time": 1776675288756439800,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "34f5152a-100c-4d02-99f1-986831484764",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "79177a68-6205-4653-8f2c-a06bebdfc206",
            "name": "custom_search_strategy",
            "description": "用户自定义的搜索策略，如果用户输入的意图是找数问题，那么就需要使用该工具，传入查询的问题，rule_base_name当前值是：自定义搜索策略-主推表策略",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "c181b0e7-917e-49e0-adcf-e3f0b563d055",
              "summary": "custom_search_strategy",
              "description": "用户自定义的搜索策略，如果用户输入的意图是找数问题，那么就需要使用该工具，传入查询的问题，rule_base_name当前值是：自定义搜索策略-主推表策略",
              "server_url": "http://af-sailor-agent:9595",
              "path": "/api/af-sailor-agent/v1/assistant/tools/custom_search_strategy",
              "method": "POST",
              "create_time": 1776675288754724000,
              "update_time": 1776675288754724000,
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
                          "llm": {
                            "description": "LLM 配置参数（可选）",
                            "type": "object"
                          },
                          "query": {
                            "description": "用户输入的问题（必填）",
                            "type": "string"
                          },
                          "rule_base_name": {
                            "default": "自定义规则库",
                            "description": "规则库的名称，默认为'自定义规则库'（可选）",
                            "type": "string"
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
                            "cache_key": {
                              "type": "string"
                            },
                            "matched": {
                              "type": "boolean"
                            },
                            "priority_table_name": {
                              "type": "string"
                            },
                            "result": {
                              "type": "string"
                            },
                            "rule_key": {
                              "type": "string"
                            },
                            "rule_value": {
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
            "create_time": 1776675288756439800,
            "update_time": 1776675288756439800,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "c181b0e7-917e-49e0-adcf-e3f0b563d055",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          }
        ],
        "create_time": 1776675288753524700,
        "update_time": 1776675300391300600,
        "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
        "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
        "metadata_type": "openapi"
      }
    ]
  }
}