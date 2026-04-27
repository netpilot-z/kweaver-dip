# KWeaver DIP 0.5.0 Release Notes

KWeaver DIP 0.5.0 focuses on a comprehensive improvement of the user experience, with key optimizations centered on deployment flexibility, proactive monitoring of Business Knowledge Network status, and improved accuracy for the Data Analyst's data discovery and querying capabilities.

---

## Core Highlights

- **DIP Studio**: Added dual deployment modes for OpenClaw and skill package metadata validation; optimized navigation structure and page transition experience to effectively lower the barrier for platform deployment and onboarding.
- **BKN Creator**: Supports automatic extraction of business rules from PRDs to generate Skills; introduced scheduled inspection and status detection mechanisms for proactive monitoring of Business Knowledge Network health.
- **Data Analyst**: Comprehensive optimization of semantic recognition and result accuracy for data discovery and querying; added ambiguous field clarification, abnormal loop interruption, and automatic Token renewal mechanisms to ensure stable and reliable query execution.

---

## DIP Studio

This release continues to iterate across three areas—deployment flexibility, skill upload validation, and operational experience—enabling platform onboarding at a lower barrier and improving the overall user experience.

### OpenClaw Dual Deployment Mode Support

Supports two methods for connecting to OpenClaw: users can deploy independently on their own hosts, or use the containerized OpenClaw bundled with the DIP Studio image directly. Both modes can be selected flexibly based on actual infrastructure requirements, lowering the deployment barrier.

### Skill Package Metadata Validation on Upload

Supports automatic detection of the completeness of header metadata in `SKILL.md` files when uploading skill packages. If metadata is missing, the system will reject the upload and prompt the user to provide the required information, preventing issues where a skill is uploaded successfully but cannot be recognized by OpenClaw, thereby reducing troubleshooting costs.

### Single Sign-On Jump to Business Knowledge Network and System Console

Supports direct navigation from DIP Studio to the Business Knowledge Network and system console pages without requiring repeated login authentication, improving the smoothness of day-to-day operations.

### Card-Based Display for Domain Knowledge Networks

Created Domain Knowledge Networks can be displayed in a card layout on the page, allowing users to intuitively view the basic information, last modifier, and update time of each Domain Knowledge Network.

### Navigation Structure Adjustment and Optimization

Optimized the navigation of the Business Knowledge Network page. The updated navigation includes: Domain Knowledge Network, General Knowledge Network, Decision Agent, Execution Factory, and Autoflow modules. Within the Decision Agent module, the structure has been adjusted to two sub-pages—**Develop** and **Square**—with the original API and Templates pages consolidated and migrated to the Square page.

### Bug Fixes

- Fixed an error that occurred when creating platform-preset BKN Digital Workers after locally deploying OpenClaw 3.11.
- Fixed an error in previewing the plan document when publishing a new Digital Worker on the platform.
- Fixed an issue where modifying the OpenClaw configuration during dip-hub interface initialization did not take effect; also optimized the deployment script to avoid redundant OpenClaw information entry during interface initialization.
- Fixed abnormal title display in the Digital Worker history list.
- Fixed an issue where files uploaded during a conversation were not shown on the history page.
- Fixed an issue where tool input and output content was not displayed in the interface during Digital Worker execution; now supports viewing full tool call details.
- Fixed an issue where a Business Knowledge Network could not be created or selected when configuring a Digital Worker.
- Fixed abnormal display of execution results after a plan executed successfully, ensuring the status is consistent with the actual execution outcome.
- Fixed an error that occurred when copying content on the Digital Worker conversation page; now supports one-click copy of conversation content.

---

## BKN Creator

This release introduces a mechanism for generating Skills from business rules extracted from PRDs, and adds scheduled task and Business Knowledge Network detection capabilities to enable dynamic issue discovery and improvement suggestions.

> **Note: The following features are Enterprise Edition capabilities.**

### Business Rule Extraction from PRD to Generate Skills

Supports automatic extraction of business rules from requirements documents (PRDs) when creating a Domain Knowledge Network, and encapsulates them as reusable Skills. When a user submits a query, the system performs targeted lookups on the Business Knowledge Network via Skills, allowing business rules to genuinely participate in the reasoning and response process—effectively reducing hallucination risks caused by missing rules.

### Scheduled Inspection Tasks for Business Knowledge Networks

Supports configuring scheduled tasks for Business Knowledge Networks that automatically trigger specified operations at set intervals, enabling periodic operations and maintenance monitoring. Users do not need to intervene manually; the platform handles task scheduling and execution at the designated times.

### Business Knowledge Network Status Detection

Supports periodic inspection of Business Knowledge Networks, automatically verifying data mapping accuracy, data connection status, and overall availability. This shifts Business Knowledge Network status management from "passively discovering problems" to "proactively preventing risks," ensuring that Digital Workers always rely on an accurate and available knowledge foundation when executing tasks.

---

## Data Analyst

### Optimization of Data Discovery and Query Result Accuracy

Optimized the matching logic between data discovery results and actual data in the Business Knowledge Network. Resolved issues including returning non-existent data tables, failing to surface relevant tables that should have been matched, and returning duplicate results or model hallucinations in queries—ensuring that data discovery and query results are accurate and verifiable.

### Table Name and Data Completeness Optimization

Optimized the display and data backfill logic for data discovery results. Resolved issues of truncated table name display and mismatches between returned UUIDs and actual data, ensuring that data discovery results are complete, authentic, and traceable.

### Automatic Token Renewal on Expiry

Supports automatic re-acquisition of tokens and continuation of query execution when token expiry is detected during the data discovery process, without requiring manual user intervention—ensuring the stability and continuity of the data discovery workflow.

### Output Completeness Optimization

Resolved the issue of responses being abruptly cut off during data discovery and querying, where content could not be fully output. Ensures that every query delivers a complete presentation of analytical conclusions and data results.

### Industry-Specific Terminology Recognition and Proactive Clarification for Ambiguous Fields

Supports recognition of industry-specific abbreviations in user queries and correct matching to the corresponding Business Knowledge Network. When a queried field exists in multiple tables, the system proactively asks the user for clarification rather than selecting a table and responding directly—improving semantic recognition accuracy and interaction quality in ambiguous scenarios.

### Abnormal Loop Interruption Mechanism for Queries

Supports automatic interruption when the target table cannot be located during a query, preventing the system from falling into an ineffective loop of repeated table-search operations.

### Precise Cross-Table Field Location for Queries

Supports accurate identification and selection of the data table containing the target field in scenarios where the required field exists across multiple tables, resolving the issue of fields not being found due to incorrect table selection—improving the accuracy and stability of multi-table query scenarios.

---

## Related Resources

**GitHub Open Source Repository**

- DIP Studio: https://github.com/kweaver-ai/kweaver-dip/tree/main/dip-studio
- Data Semantic Governance: https://github.com/kweaver-ai/kweaver-dip/tree/main/dsg
- Data Analyst: https://github.com/kweaver-ai/kweaver-dip/tree/main/chat-data
