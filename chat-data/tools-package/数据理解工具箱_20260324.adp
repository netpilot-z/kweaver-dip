{
  "toolbox": {
    "configs": [
      {
        "box_id": "0a14ba57-5102-43a6-9836-f7be0fd44e48",
        "box_name": "数据理解工具箱_20260324",
        "box_desc": "数据理解 kweaver",
        "box_svc_url": "http://af-sailor-agent:9595",
        "status": "published",
        "category_type": "data_analysis",
        "category_name": "数据分析",
        "is_internal": false,
        "source": "custom",
        "tools": [
          {
            "tool_id": "f486d8e3-815d-42ef-8198-5b090bd893aa",
            "name": "数据分类分级工具",
            "description": "对数据库表进行业务分类和数据分级，识别业务领域、数据类型、数据来源和重要性级别",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "0dddf4dd-5219-4a31-9561-e002f9cda12f",
              "summary": "数据分类分级工具",
              "description": "对数据库表进行业务分类和数据分级，识别业务领域、数据类型、数据来源和重要性级别",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/tools/data_classification_detect",
              "method": "POST",
              "create_time": 1774245800488441000,
              "update_time": 1774245800488441000,
              "create_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
              "update_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
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
                                "description": "背景上下文信息",
                                "type": "string"
                              },
                              "data_source_num_limit": {
                                "description": "数据源数量限制，默认-1（无限制）",
                                "type": "integer"
                              },
                              "dimension_num_limit": {
                                "description": "维度数量限制，默认-1（无限制）",
                                "type": "integer"
                              },
                              "with_sample": {
                                "description": "是否包含样例数据，默认false",
                                "type": "boolean"
                              }
                            },
                            "type": "object"
                          },
                          "data_view_list": {
                            "description": "库表id列表，需要分类分级的表ID列表",
                            "items": {
                              "type": "string"
                            },
                            "type": "array"
                          },
                          "llm": {
                            "description": "LLM 配置参数",
                            "type": "object"
                          },
                          "query": {
                            "description": "用户的查询需求，用于理解分类分级上下文",
                            "type": "string"
                          }
                        },
                        "required": [
                          "query",
                          "data_view_list"
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
                            "result": {
                              "description": "数据分类分级结果",
                              "type": "object"
                            },
                            "result_cache_key": {
                              "description": "结果缓存key",
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
            "create_time": 1774245800491285500,
            "update_time": 1774245810368267000,
            "create_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
            "update_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "0dddf4dd-5219-4a31-9561-e002f9cda12f",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "4ac3e374-4c85-4ac5-9ba4-437404b73c1d",
            "name": "质量规则识别工具",
            "description": "从库表列表中识别数据质量规则和约束条件，包括完整性、准确性、一致性、时效性、有效性、合理性等规则",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "b1e99a94-a576-4c3d-a579-bbb552af11be",
              "summary": "质量规则识别工具",
              "description": "从库表列表中识别数据质量规则和约束条件，包括完整性、准确性、一致性、时效性、有效性、合理性等规则",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/tools/explore_rule_identification",
              "method": "POST",
              "create_time": 1774245800498731500,
              "update_time": 1774245800498731500,
              "create_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
              "update_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
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
                                "description": "背景上下文信息",
                                "type": "string"
                              },
                              "data_source_num_limit": {
                                "description": "数据源数量限制，默认-1（无限制）",
                                "type": "integer"
                              },
                              "dimension_num_limit": {
                                "description": "维度数量限制，默认-1（无限制）",
                                "type": "integer"
                              },
                              "with_sample": {
                                "description": "是否包含样例数据，默认false",
                                "type": "boolean"
                              }
                            },
                            "type": "object"
                          },
                          "data_view_list": {
                            "description": "库表id列表，需要识别质量规则的表ID列表",
                            "items": {
                              "type": "string"
                            },
                            "type": "array"
                          },
                          "llm": {
                            "description": "LLM 配置参数",
                            "type": "object"
                          },
                          "query": {
                            "description": "用户的查询需求，用于理解质量规则识别上下文",
                            "type": "string"
                          }
                        },
                        "required": [
                          "query",
                          "data_view_list"
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
                            "result": {
                              "description": "质量规则识别结果",
                              "type": "object"
                            },
                            "result_cache_key": {
                              "description": "结果缓存key",
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
            "create_time": 1774245800500726300,
            "update_time": 1774245810367090400,
            "create_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
            "update_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "b1e99a94-a576-4c3d-a579-bbb552af11be",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "cbceab9c-7118-4255-bf97-57735c04f8cb",
            "name": "语义补全工具",
            "description": "语义补全工具是一款面向数据库开发、数据治理、数据分析场景的智能化辅助工具，核心功能是针对数据库中的库表名称、字段名称，自动完成语义化中文名补全，解决数据库对象 “英文缩写无释义”“命名不规范”“语义不清晰” 的痛点问题",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "f757be74-0d80-4b48-b3af-dea4a2c76136",
              "summary": "语义补全工具",
              "description": "语义补全工具是一款面向数据库开发、数据治理、数据分析场景的智能化辅助工具，核心功能是针对数据库中的库表名称、字段名称，自动完成语义化中文名补全，解决数据库对象 “英文缩写无释义”“命名不规范”“语义不清晰” 的痛点问题",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/tools/semantic_complete",
              "method": "POST",
              "create_time": 1774245800510221600,
              "update_time": 1774245800510221600,
              "create_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
              "update_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
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
                                "description": "背景上下文信息",
                                "type": "string"
                              },
                              "data_item_ids": {
                                "description": "知识条目id列表, 逗号隔开",
                                "type": "string"
                              },
                              "data_source_num_limit": {
                                "description": "数据源数量限制，默认-1（无限制）",
                                "type": "integer"
                              },
                              "dimension_num_limit": {
                                "description": "维度数量限制，默认-1（无限制）",
                                "type": "integer"
                              },
                              "with_sample": {
                                "description": "是否包含样例数据，默认false",
                                "type": "boolean"
                              }
                            },
                            "type": "object"
                          },
                          "data_view_list": {
                            "description": "库表id列表，需要语义补全的表ID列表",
                            "items": {
                              "type": "string"
                            },
                            "type": "array"
                          },
                          "llm": {
                            "description": "LLM 配置参数",
                            "type": "object"
                          },
                          "query": {
                            "description": "用户的查询需求，用于理解检测上下文",
                            "type": "string"
                          }
                        },
                        "required": [
                          "query",
                          "data_view_list"
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
            "create_time": 1774245800511748600,
            "update_time": 1774245810365034000,
            "create_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
            "update_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "f757be74-0d80-4b48-b3af-dea4a2c76136",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "462468bb-401a-4dbc-b9e7-443098ee28f5",
            "name": "敏感字段检测工具",
            "description": "检测数据库表中可能包含敏感信息的字段，识别个人身份信息、财务信息、健康信息等敏感数据类型",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "e56da58b-72cc-4a1c-b1ed-fd9ca21f4f75",
              "summary": "敏感字段检测工具",
              "description": "检测数据库表中可能包含敏感信息的字段，识别个人身份信息、财务信息、健康信息等敏感数据类型",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/tools/sensitive_data_detect",
              "method": "POST",
              "create_time": 1774245800516933000,
              "update_time": 1774245800516933000,
              "create_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
              "update_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
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
                                "description": "背景上下文信息",
                                "type": "string"
                              },
                              "data_source_num_limit": {
                                "description": "数据源数量限制，默认-1（无限制）",
                                "type": "integer"
                              },
                              "dimension_num_limit": {
                                "description": "维度数量限制，默认-1（无限制）",
                                "type": "integer"
                              },
                              "with_sample": {
                                "description": "是否包含样例数据，默认false",
                                "type": "boolean"
                              }
                            },
                            "type": "object"
                          },
                          "data_view_list": {
                            "description": "库表id列表，需要检测敏感字段的表ID列表",
                            "items": {
                              "type": "string"
                            },
                            "type": "array"
                          },
                          "llm": {
                            "description": "LLM 配置参数",
                            "type": "object"
                          },
                          "query": {
                            "description": "用户的查询需求，用于理解检测上下文",
                            "type": "string"
                          }
                        },
                        "required": [
                          "query",
                          "data_view_list"
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
                            "result": {
                              "description": "敏感字段检测结果",
                              "type": "object"
                            },
                            "result_cache_key": {
                              "description": "结果缓存key",
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
            "create_time": 1774245800518282200,
            "update_time": 1774245810361973200,
            "create_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
            "update_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "e56da58b-72cc-4a1c-b1ed-fd9ca21f4f75",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          },
          {
            "tool_id": "276c3d92-0632-4839-874a-a227218b4893",
            "name": "业务对象识别工具",
            "description": "从库表列表中识别业务对象，分析表的业务含义和对象特征",
            "status": "enabled",
            "metadata_type": "openapi",
            "metadata": {
              "version": "cf40db6f-f57d-43e4-a19e-37303e5472c1",
              "summary": "业务对象识别工具",
              "description": "从库表列表中识别业务对象，分析表的业务含义和对象特征",
              "server_url": "http://localhost:8000",
              "path": "/api/af-sailor-agent/v1/assistant/tools/business_object_identification",
              "method": "POST",
              "create_time": 1774245800526285000,
              "update_time": 1774245800526285000,
              "create_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
              "update_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
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
                                "description": "背景上下文信息",
                                "type": "string"
                              },
                              "data_item_ids": {
                                "description": "知识条目id列表, 逗号隔开",
                                "type": "string"
                              },
                              "data_source_num_limit": {
                                "description": "数据源数量限制，默认-1（无限制）",
                                "type": "integer"
                              },
                              "dimension_num_limit": {
                                "description": "维度数量限制，默认-1（无限制）",
                                "type": "integer"
                              },
                              "with_sample": {
                                "description": "是否包含样例数据，默认false",
                                "type": "boolean"
                              }
                            },
                            "type": "object"
                          },
                          "data_view_list": {
                            "description": "库表id列表，需要识别业务对象的表ID列表",
                            "items": {
                              "type": "string"
                            },
                            "type": "array"
                          },
                          "llm": {
                            "description": "LLM 配置参数",
                            "type": "object"
                          },
                          "query": {
                            "description": "用户的查询需求，用于理解业务对象识别上下文",
                            "type": "string"
                          }
                        },
                        "required": [
                          "query",
                          "data_view_list"
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
                            "result": {
                              "description": "业务对象识别结果",
                              "type": "object"
                            },
                            "result_cache_key": {
                              "description": "结果缓存key",
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
            "create_time": 1774245800527683600,
            "update_time": 1774245810363861200,
            "create_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
            "update_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
            "extend_info": null,
            "resource_object": "tool",
            "source_id": "cf40db6f-f57d-43e4-a19e-37303e5472c1",
            "source_type": "openapi",
            "script_type": "",
            "code": "",
            "dependencies": [],
            "dependencies_url": ""
          }
        ],
        "create_time": 1769146721770471400,
        "update_time": 1774315289860835300,
        "create_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
        "update_user": "cbf93ec4-ea19-11f0-9c74-c2868d7b6f84",
        "metadata_type": "openapi"
      }
    ]
  }
}