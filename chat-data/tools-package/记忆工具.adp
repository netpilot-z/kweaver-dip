{
  "toolbox": {
    "configs": [
      {
        "box_id": "4521282b-a1e4-451a-abdc-77e50fbaee4b",
        "box_name": "记忆工具",
        "box_desc": "用户偏好和业务规则的搜索和写入",
        "box_svc_url": "http://sailor-agent:9595",
        "status": "published",
        "category_type": "other_category",
        "category_name": "未分类",
        "is_internal": false,
        "source": "custom",
        "tools": [
          {
            "tool_id": "788b114f-7ff5-4c71-80a7-fc6e8c4f9bf2",
            "name": "memory_search",
            "description": "长期记忆检索工具。当需要回顾用户在过去历史对话中表达过的稳定偏好、长期约定、业务规则、配置信息等内容时，应优先调用此工具。根据当前问题用自然语言构造简短的 query；可按需指定 source_types 过滤：查用户偏好/习惯/画像时传 source_types: [\"profile\"]；问数场景下业务口径、指标定义等使用 source_types: [\"business_rule\"]；不传则检索全部类型。返回结果中每条记忆包含唯一 id，可用于 memory_write 更新该条记忆。",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "04431a72-b506-4ca8-b0aa-afbf93ef2b96",
              "summary": "memory_search",
              "description": "长期记忆检索工具。当需要回顾用户在过去历史对话中表达过的稳定偏好、长期约定、业务规则、配置信息等内容时，应优先调用此工具。根据当前问题用自然语言构造简短的 query；可按需指定 source_types 过滤：查用户偏好/习惯/画像时传 source_types: [\"profile\"]；问数场景下业务口径、指标定义等使用 source_types: [\"business_rule\"]；不传则检索全部类型。返回结果中每条记忆包含唯一 id，可用于 memory_write 更新该条记忆。",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/memory/search",
              "method": "POST",
              "create_time": 1776677237943737000,
              "update_time": 1776677237943737000,
              "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "api_spec": {
                "parameters": [],
                "request_body": {
                  "description": "",
                  "content": {
                    "application/json": {
                      "schema": {
                        "description": "检索输入参数",
                        "properties": {
                          "datasource_ids": {
                            "description": "按数据源 ID 过滤；用户偏好场景一般不传",
                            "items": {
                              "type": "string"
                            },
                            "type": "array"
                          },
                          "filters": {
                            "description": "更细粒度过滤条件（如时间范围、location 前缀等）",
                            "type": "object"
                          },
                          "query": {
                            "description": "自然语言检索 query，通常为一两句中文搜索词或问题",
                            "type": "string"
                          },
                          "source_types": {
                            "description": "记忆类型过滤：profile-用户画像/偏好；business_rule-业务规则/指标口径/统计口径。不传则检索全部类型",
                            "items": {
                              "enum": [
                                "profile",
                                "business_rule"
                              ],
                              "type": "string"
                            },
                            "type": "array"
                          },
                          "top_k": {
                            "default": 8,
                            "description": "返回条数上限",
                            "type": "integer"
                          },
                          "user_id": {
                            "description": "用户 ID，由系统注入",
                            "type": "integer"
                          }
                        },
                        "required": [
                          "user_id",
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
                    "description": "检索成功",
                    "content": {
                      "application/json": {
                        "schema": {
                          "properties": {
                            "memories": {
                              "description": "命中的记忆列表",
                              "items": {
                                "properties": {
                                  "datasource_id": {
                                    "description": "数据源 ID",
                                    "type": "string"
                                  },
                                  "document_id": {
                                    "description": "文档 ID",
                                    "type": "string"
                                  },
                                  "id": {
                                    "description": "记忆唯一 ID，可用于 memory_write 更新",
                                    "type": "string"
                                  },
                                  "location": {
                                    "description": "位置信息",
                                    "type": "string"
                                  },
                                  "metadata": {
                                    "description": "元数据",
                                    "type": "object"
                                  },
                                  "score": {
                                    "description": "相关性得分",
                                    "type": "number"
                                  },
                                  "text": {
                                    "description": "记忆文本",
                                    "type": "string"
                                  },
                                  "title": {
                                    "description": "标题",
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
            "create_time": 1776677237944775400,
            "update_time": 1776677237944775400,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "04431a72-b506-4ca8-b0aa-afbf93ef2b96",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "73ece7c8-0a9e-49c2-b85d-e19a5120ea47",
            "name": "memory_write",
            "description": "长期记忆写入工具。当发现对未来多轮对话有持续帮助的信息时，使用本工具持久化存储，例如：用户偏好、长期适用的业务规则、稳定配置说明、协作约定等。写入内容应为简洁自然语言摘要。使用 source_type: \"profile\" 时一般无需传 datasource_id。若需更新已有记忆：在 documents 中传入 memory_search 返回的 id 及新 text 即可覆盖更新。",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "6174d369-a537-4d39-80b2-c291790b17d5",
              "summary": "memory_write",
              "description": "长期记忆写入工具。当发现对未来多轮对话有持续帮助的信息时，使用本工具持久化存储，例如：用户偏好、长期适用的业务规则、稳定配置说明、协作约定等。写入内容应为简洁自然语言摘要。使用 source_type: \"profile\" 时一般无需传 datasource_id。若需更新已有记忆：在 documents 中传入 memory_search 返回的 id 及新 text 即可覆盖更新。",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/memory/write",
              "method": "POST",
              "create_time": 1776677237943737000,
              "update_time": 1776677237943737000,
              "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
              "api_spec": {
                "parameters": [],
                "request_body": {
                  "description": "",
                  "content": {
                    "application/json": {
                      "schema": {
                        "description": "写入输入参数",
                        "properties": {
                          "documents": {
                            "description": "待写入的记忆文档列表",
                            "items": {
                              "properties": {
                                "datasource_id": {
                                  "description": "可选；数据源实例标识，profile 场景一般不传",
                                  "type": "string"
                                },
                                "id": {
                                  "description": "可选；若传入已有记忆的 id 则对该条记忆覆盖更新，否则新建",
                                  "type": "string"
                                },
                                "location": {
                                  "description": "可选位置信息",
                                  "type": "string"
                                },
                                "metadata": {
                                  "description": "可选元数据",
                                  "type": "object"
                                },
                                "source_type": {
                                  "description": "记忆类型，默认 business_rule",
                                  "enum": [
                                    "business_rule",
                                    "profile"
                                  ],
                                  "type": "string"
                                },
                                "text": {
                                  "description": "必填。记忆内容摘要，简明扼要便于后续检索",
                                  "type": "string"
                                },
                                "title": {
                                  "description": "可选标题",
                                  "type": "string"
                                }
                              },
                              "required": [
                                "text"
                              ],
                              "type": "object"
                            },
                            "type": "array"
                          },
                          "user_id": {
                            "description": "用户 ID，由系统注入",
                            "type": "integer"
                          }
                        },
                        "required": [
                          "user_id",
                          "documents"
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
                    "description": "写入成功",
                    "content": {
                      "application/json": {
                        "schema": {
                          "properties": {
                            "written_ids": {
                              "description": "本次成功写入的记忆 ID 列表",
                              "items": {
                                "type": "string"
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
            "create_time": 1776677237944775400,
            "update_time": 1776677237944775400,
            "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "6174d369-a537-4d39-80b2-c291790b17d5",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          }
        ],
        "create_time": 1776677237942609200,
        "update_time": 1776677281915539500,
        "create_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
        "update_user": "202f2290-3c8d-11f1-8ef6-42f63f9e1fce",
        "metadata_type": "openapi"
      }
    ]
  }
}