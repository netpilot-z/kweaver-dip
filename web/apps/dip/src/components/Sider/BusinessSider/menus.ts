export interface BusinessMenuLeafItem {
  key: string;
  icon?: string;
  labelKey: string;
  path: string;
  page:
    | {
        type: 'micro-app';
        app: {
          name: string;
          entry: string;
        };
      }
    | {
        type: 'component';
        componentKey: string;
      };
}

export interface BusinessMenuGroupItem {
  key: string;
  icon?: string;
  labelKey: string;
  children: BusinessMenuItem[];
}

export type BusinessMenuItem = BusinessMenuLeafItem | BusinessMenuGroupItem;

export const BUSINESS_NETWORK_BASE_PATH = '/business-network';
export const buildBusinessNetworkPath = (suffix = ''): string => `${BUSINESS_NETWORK_BASE_PATH}${suffix}`;

/**
 * business 菜单单一数据源：
 * - Sider 渲染读取这里
 * - 路由注册也读取这里
 * 新增菜单时只改这一处。
 */
export const businessMenuItems: BusinessMenuItem[] = [
  {
    key: 'ontology',
    icon: 'icon-DomainBKN',
    labelKey: 'routes.businessMenu.ontology',
    path: buildBusinessNetworkPath('/vega/ontology'),
    page: {
      type: 'micro-app',
      app: {
        name: 'ontology-manage',
        entry: '//ip:port/vega/ontology',
      },
    },
  },
  {
    key: 'vega',
    icon: 'icon-SharedBKN',
    labelKey: 'routes.businessMenu.vega',
    children: [
      {
        key: 'dataConnection',
        labelKey: 'routes.businessMenu.dataConnection',
        path: buildBusinessNetworkPath('/vega/data-connect'),
        page: {
          type: 'micro-app',
          app: {
            name: 'data-connect',
            entry: '//ip:port/vega/data-connect',
          },
        },
      },
      {
        key: 'dataView',
        labelKey: 'routes.businessMenu.dataView',
        children: [
          {
            key: 'atomicDataView',
            labelKey: 'routes.businessMenu.atomicDataView',
            path: buildBusinessNetworkPath('/vega/atom-data-view'),
            page: {
              type: 'micro-app',
              app: {
                name: 'atom-data-view',
                entry: '//ip:port/vega/atom-data-view',
              },
            },
          },
          {
            key: 'customDataView',
            labelKey: 'routes.businessMenu.customDataView',
            path: buildBusinessNetworkPath('/vega/custom-data-view'),
            page: {
              type: 'micro-app',
              app: {
                name: 'custom-data-view',
                entry: '//ip:port/vega/custom-data-view',
              },
            },
          },
        ],
      },
      {
        key: 'dataModel',
        labelKey: 'routes.businessMenu.dataModel',
        children: [
          {
            key: 'metricModel',
            labelKey: 'routes.businessMenu.metricModel',
            path: buildBusinessNetworkPath('/vega/metric-model'),
            page: {
              type: 'micro-app',
              app: {
                name: 'metric-model',
                entry: '//ip:port/vega/metric-model',
              },
            },
          },
        ],
      },
      {
        key: 'knowledge-items',
        labelKey: 'routes.businessMenu.knowledgeItems',
        path: buildBusinessNetworkPath('/mdl/data-dict'),
        page: {
          type: 'micro-app',
          app: {
            name: 'data-dict',
            entry: '//ip:port/mdl/web/',
          },
        },
      },
      {
        key: 'data-semantic-governance',
        labelKey: 'routes.businessMenu.dataSemanticGovernance',
        path: buildBusinessNetworkPath('/data-semantic-governance'),
        page: {
          type: 'micro-app',
          app: {
            name: 'data-semantic-governance',
            entry: '//ip:port/anyfabric/semanticGovernance.html',
          },
        },
      },
    ],
  },
  {
    key: 'decision-agent',
    icon: 'icon-agent-factory',
    labelKey: 'routes.businessMenu.decision-agent',
    children: [
      {
        key: 'myAgents',
        labelKey: 'routes.businessMenu.myAgents',
        path: buildBusinessNetworkPath('/my-agents'),
        page: {
          type: 'micro-app',
          app: {
            name: 'my-agent-list',
            entry: '//ip:port/agent-web/my-agents.html',
          },
        },
      },
      {
        key: 'agent-square',
        labelKey: 'routes.businessMenu.agent-square',
        path: buildBusinessNetworkPath('/agent-square'),
        page: {
          type: 'micro-app',
          app: {
            name: 'agent-square',
            entry: '//ip:port/agent-web/square.html',
          },
        },
      },
    ],
  },
  {
    key: 'execution-factory',
    icon: 'icon-operator-factory',
    labelKey: 'routes.businessMenu.execution-factory',
    children: [
      {
        key: 'executionManagement',
        labelKey: 'routes.businessMenu.executionManagement',
        path: buildBusinessNetworkPath('/execution-management'),
        page: {
          type: 'micro-app',
          app: {
            name: 'operator-management',
            entry: '//ip:port/operator-web/operator-management.html',
          },
        },
      },
      {
        key: 'allExecutions',
        labelKey: 'routes.businessMenu.allExecutions',
        path: buildBusinessNetworkPath('/all-executions'),
        page: {
          type: 'micro-app',
          app: {
            name: 'all-operators',
            entry: '//ip:port/operator-web/all-operators.html',
          },
        },
      },
    ],
  },
  {
    key: 'autoflow',
    icon: 'icon-workflow',
    labelKey: 'routes.businessMenu.autoflow',
    children: [
      {
        key: 'dataflow',
        labelKey: 'routes.businessMenu.dataflow',
        path: buildBusinessNetworkPath('/dataflow'),
        page: {
          type: 'micro-app',
          app: {
            name: 'data-processing',
            entry: '//ip:port/flow-web/dataStudio.html',
          },
        },
      },
      {
        key: 'workflow',
        labelKey: 'routes.businessMenu.workflow',
        path: buildBusinessNetworkPath('/workflow'),
        page: {
          type: 'micro-app',
          app: {
            name: 'workflow',
            entry: '//ip:port/flow-web/workflow.html',
          },
        },
      },
    ],
  },
];

const flattenLeafItems = (items: BusinessMenuItem[]): BusinessMenuLeafItem[] =>
  items.flatMap(item => ('children' in item ? flattenLeafItems(item.children) : item));

export const businessLeafMenuItems: BusinessMenuLeafItem[] = flattenLeafItems(businessMenuItems);

const findAncestorKeysByPath = (items: BusinessMenuItem[], pathname: string, parentKeys: string[] = []): string[] => {
  for (const item of items) {
    if ('children' in item) {
      const found = findAncestorKeysByPath(item.children, pathname, [...parentKeys, item.key]);
      if (found.length > 0) {
        return found;
      }
      continue;
    }
    if (pathname.startsWith(item.path)) {
      return parentKeys;
    }
  }
  return [];
};

export const getBusinessAncestorKeysByPath = (pathname: string): string[] =>
  findAncestorKeysByPath(businessMenuItems, pathname);

export const defaultBusinessMenuItem = businessLeafMenuItems[0];
