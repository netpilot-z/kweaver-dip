import { getCommonHttpHeaders } from '@/utils/http';

export interface SkillFileSummary {
  rel_path: string;
  file_type?: string;
  size?: number;
  mime_type?: string;
}

export interface SkillTreeNode extends SkillFileSummary {
  key: string;
  title: string;
  path: string;
  nodeType: 'file' | 'directory';
  isLeaf?: boolean;
  children?: SkillTreeNode[];
}

const skillRootFileName = 'SKILL.md';

const compareSkillPaths = (leftPath: string, rightPath: string) => {
  if (leftPath === skillRootFileName) {
    return -1;
  }

  if (rightPath === skillRootFileName) {
    return 1;
  }

  return leftPath.localeCompare(rightPath);
};

export const unwrapSkillResponse = <T = any>(response: any): T => {
  if (response && typeof response === 'object' && 'data' in response && !Array.isArray(response.data)) {
    return response.data as T;
  }

  return response as T;
};

export const buildSkillTreeData = (files: SkillFileSummary[] = []): SkillTreeNode[] => {
  const normalizedFiles = [
    { rel_path: skillRootFileName, file_type: 'file', mime_type: 'text/markdown' },
    ...files.filter(file => file?.rel_path && file.rel_path !== skillRootFileName),
  ].sort((left, right) => compareSkillPaths(left.rel_path, right.rel_path));

  const tree: SkillTreeNode[] = [];
  const nodeMap = new Map<string, SkillTreeNode>();

  normalizedFiles.forEach(file => {
    const segments = file.rel_path.split('/').filter(Boolean);
    let currentChildren = tree;
    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      const isLeaf = index === segments.length - 1;
      const mapKey = `${isLeaf ? 'file' : 'dir'}:${currentPath}`;
      const existingNode = nodeMap.get(mapKey);

      if (existingNode) {
        currentChildren = existingNode.children || [];
        return;
      }

      const nextNode: SkillTreeNode = {
        key: mapKey,
        title: segment,
        path: currentPath,
        rel_path: currentPath,
        file_type: isLeaf ? file.file_type : 'directory',
        mime_type: isLeaf ? file.mime_type : undefined,
        size: isLeaf ? file.size : undefined,
        nodeType: isLeaf ? 'file' : 'directory',
        isLeaf,
        children: isLeaf ? undefined : [],
      };

      currentChildren.push(nextNode);
      nodeMap.set(mapKey, nextNode);
      currentChildren = nextNode.children || [];
    });
  });

  return tree;
};

export const findSkillTreeNode = (nodes: SkillTreeNode[], key?: string): SkillTreeNode | undefined => {
  if (!key) {
    return undefined;
  }

  for (const node of nodes) {
    if (node.key === key) {
      return node;
    }

    if (node.children?.length) {
      const matched = findSkillTreeNode(node.children, key);
      if (matched) {
        return matched;
      }
    }
  }

  return undefined;
};

export const fetchRemoteText = async (url: string): Promise<string> => {
  const response = await fetch(url, {
    headers: getCommonHttpHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.text();
};

export const fetchRemoteBlob = async (url: string): Promise<Blob> => {
  const response = await fetch(url, {
    headers: getCommonHttpHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.blob();
};
