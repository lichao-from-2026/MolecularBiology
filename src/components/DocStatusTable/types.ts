/**
 * 文档状态表格组件 - 类型定义
 * 定义组件的接口和数据结构
 */

/**
 * 文档状态项接口
 */
export interface DocStatusItem {
  id: string;              // 文档唯一标识
  title: string;           // 文档标题
  description?: string;       // 简洁描述（折叠时显示）
  details?: string | string[]; // 详细内容（展开时显示）
  filePath?: string;        // 文档路径
  status: 'pending' | 'in-progress' | 'completed'; // 状态
}

/**
 * 文档状态表格属性接口
 */
export interface DocStatusTableProps {
  items: DocStatusItem[];    // 文档列表
  title?: string;            // 表格标题
  storageKey?: string;       // localStorage 键名
}

/**
 * 状态配置接口
 */
export interface StatusConfig {
  text: string;
  icon: React.ReactNode;
  class: string;
  color: string;
}

/**
 * 状态统计信息接口
 */
export interface StatusStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}
