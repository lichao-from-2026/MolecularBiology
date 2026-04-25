/**
 * 状态选择器组件 - 类型定义
 * 定义组件的接口和数据结构
 */

/**
 * 状态项接口
 */
export interface StatusItem {
  id: string;               // 项目唯一标识
  label: string;            // 项目标签
  description?: string;      // 项目描述
  status: 'pending' | 'in-progress' | 'completed'; // 状态
  filePath?: string;         // 文件路径
}

/**
 * 状态选择器属性接口
 */
export interface StatusSelectorProps {
  items: StatusItem[];        // 状态项列表
  storageKey?: string;        // localStorage 键名
  showDescription?: boolean;  // 是否显示描述
}

/**
 * 状态配置接口
 */
export interface StatusConfigItem {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

/**
 * 进度统计信息接口
 */
export interface ProgressStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}
