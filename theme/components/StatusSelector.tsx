/**
 * 状态选择器组件
 * 用于显示和管理知识库文档的学习进度和状态
 */
import React, { useState, useEffect } from 'react';
import './status-selector.css';

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
interface StatusSelectorProps {
  items: StatusItem[];        // 状态项列表
  storageKey?: string;        // localStorage 键名
  showDescription?: boolean;  // 是否显示描述
}

/**
 * 状态配置
 * 定义不同状态的显示文本、图标、颜色和背景色
 */
const statusConfig = {
  pending: {
    label: '待完成',
    icon: '○',
    color: '#94a3b8',
    bgColor: '#f1f5f9',
  },
  'in-progress': {
    label: '进行中',
    icon: '◐',
    color: '#f59e0b',
    bgColor: '#fef3c7',
  },
  completed: {
    label: '已完成',
    icon: '●',
    color: '#10b981',
    bgColor: '#d1fae5',
  },
};

/**
 * 状态循环顺序
 */
const statusOrder = ['pending', 'in-progress', 'completed'] as const;

/**
 * 状态选择器组件
 * @param items 状态项列表
 * @param storageKey localStorage 键名
 * @param showDescription 是否显示描述
 */
export function StatusSelector({
  items: initialItems,
  storageKey = 'knowledge-base-status',
  showDescription = true,
}: StatusSelectorProps) {
  // 状态项列表状态
  const [items, setItems] = useState<StatusItem[]>(initialItems);

  /**
   * 从 localStorage 加载状态
   */
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setItems((current) =>
          current.map((item) => ({
            ...item,
            status: (parsed[item.id] as StatusItem['status']) || 'pending',
          }))
        );
      } catch (e) {
        console.warn('Failed to parse saved status:', e);
      }
    }
  }, [storageKey]);

  /**
   * 处理状态变化
   * @param id 项目 ID
   */
  const handleStatusChange = (id: string) => {
    setItems((current) => {
      const newItems = current.map((item) => {
        if (item.id === id) {
          const currentIndex = statusOrder.indexOf(item.status);
          const nextIndex = (currentIndex + 1) % statusOrder.length;
          return { ...item, status: statusOrder[nextIndex] };
        }
        return item;
      });

      // 保存状态到 localStorage
      const statusMap: Record<string, StatusItem['status']> = {};
      newItems.forEach((item) => {
        statusMap[item.id] = item.status;
      });
      localStorage.setItem(storageKey, JSON.stringify(statusMap));

      return newItems;
    });
  };

  /**
   * 获取进度信息
   * @returns 进度统计信息
   */
  const getProgress = () => {
    const total = items.length;
    const completed = items.filter((i) => i.status === 'completed').length;
    const inProgress = items.filter((i) => i.status === 'in-progress').length;
    return { total, completed, inProgress, pending: total - completed - inProgress };
  };

  const progress = getProgress();
  const progressPercent = Math.round((progress.completed / progress.total) * 100);

  return (
    <div className="status-selector">
      <div className="status-selector-header">
        <h4 className="status-selector-title">📊 学习进度</h4>
        <div className="status-selector-stats">
          <span className="stat completed">✅ {progress.completed}</span>
          <span className="stat in-progress">🔄 {progress.inProgress}</span>
          <span className="stat pending">⬜ {progress.pending}</span>
        </div>
      </div>

      <div className="status-selector-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="progress-text">{progressPercent}% 完成</span>
      </div>

      <div className="status-selector-list">
        {items.map((item) => {
          const config = statusConfig[item.status];
          return (
            <div
              key={item.id}
              className={`status-item status-item-${item.status}`}
              onClick={() => handleStatusChange(item.id)}
            >
              <div className="status-item-icon">{config.icon}</div>
              <div className="status-item-content">
                <div className="status-item-label">{item.label}</div>
                {showDescription && item.description && (
                  <div className="status-item-description">{item.description}</div>
                )}
                {item.filePath && (
                  <div className="status-item-path">{item.filePath}</div>
                )}
              </div>
              <div
                className="status-item-badge"
                style={{ backgroundColor: config.bgColor, color: config.color }}
              >
                {config.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="status-selector-footer">
        <div className="status-legend">
          <span className="legend-item">
            <span className="legend-icon">○</span> 待完成
          </span>
          <span className="legend-item">
            <span className="legend-icon">◐</span> 进行中
          </span>
          <span className="legend-item">
            <span className="legend-icon">●</span> 已完成
          </span>
        </div>
        <div className="status-hint">点击可切换状态</div>
      </div>
    </div>
  );
}

export default StatusSelector;
