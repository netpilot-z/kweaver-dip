import { lazy } from 'react';
import { createRouteApp } from '@/utils/qiankun-entry-generator';
import { initMonacoEditor } from '@/components/CodeEditor';

const routeComponents = {
  OperatorDetailFlow: lazy(() => import('@/components/MyOperator/OperatorDetailFlow')),
  ToolDetail: lazy(() => import('@/components/Tool/ToolDetail')),
  McpDetail: lazy(() => import('@/components/MCP/McpDetail')),
  SkillDetail: lazy(() => import('@/components/Skill/SkillDetail')),
  PluginMarket: lazy(() => import('@/components/PluginMarket')),
  OperatorDetail: lazy(() => import('@/components/Operator/OperatorDetail')),
};

const routes = [
  {
    path: '/',
    element: <routeComponents.PluginMarket />,
  },
  {
    path: '/operator-detail',
    element: <routeComponents.OperatorDetail />,
  },
  {
    path: '/tool-detail',
    element: <routeComponents.ToolDetail />,
  },
  {
    path: '/mcp-detail',
    element: <routeComponents.McpDetail />,
  },
  {
    path: '/skill-detail',
    element: <routeComponents.SkillDetail />,
  },
  {
    path: '/details/:id',
    element: <routeComponents.OperatorDetailFlow />,
  },
  {
    path: '/details/:id/log/:recordId',
    element: <routeComponents.OperatorDetailFlow />,
  },
];

const { bootstrap, mount, unmount } = createRouteApp(routes, { customConfig: initMonacoEditor });
export { bootstrap, mount, unmount };
