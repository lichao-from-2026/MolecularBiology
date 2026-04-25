/**
 * 状态选择器组件 - 主组件
 * 用于显示和管理知识库文档的学习进度和状态
 */
import React from 'react';
import { useStatusSelector } from './hooks';
import type { StatusSelectorProps } from './types';
import './StatusSelector.module.css';

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
  const { items, handleStatusChange, getProgress } = useStatusSelector(initialItems, storageKey);
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
