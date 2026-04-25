/**
 * 文档状态表格组件 - 主组件
 * 用于显示和管理知识库文档的生成状态
 */
import React from 'react';
import { useDocStatusTable } from './hooks';
import type { DocStatusTableProps } from './types';
import './DocStatusTable.module.css';

/**
 * 状态配置
 * 定义不同状态的显示文本、图标、样式和颜色
 */
const statusConfig = {
  pending: {
    text: '待完成',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    class: 'pending',
    color: '#94a3b8',
  },
  'in-progress': {
    text: '进行中',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    class: 'in-progress',
    color: '#f59e0b',
  },
  completed: {
    text: '已完成',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    class: 'completed',
    color: '#10b981',
  },
};

/**
 * 文档状态表格组件
 * @param items 文档列表
 * @param title 表格标题
 * @param storageKey localStorage 键名
 */
export function DocStatusTable({
  items: initialItems,
  title,
  storageKey,
}: DocStatusTableProps) {
  const {
    items,
    animatingId,
    expandedIds,
    stats,
    progressPercent,
    handleStatusToggle,
    handleExpandToggle,
  } = useDocStatusTable(initialItems, storageKey);

  /**
   * 处理行点击事件
   * @param e 鼠标事件
   * @param id 文档 ID
   */
  const handleRowClick = (e: React.MouseEvent, id: string) => {
    const target = e.target as HTMLElement;
    if (target.closest('.expand-button') || target.closest('.status-badge')) {
      return;
    }
    e.preventDefault();
    handleStatusToggle(id);
  };

  /**
   * 处理展开/折叠点击事件
   * @param e 鼠标事件
   * @param id 文档 ID
   */
  const handleExpandClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    handleExpandToggle(id);
  };

  return (
    <div className="doc-status-table">
      {title && (
        <div className="doc-status-header">
          <div className="doc-status-header-top">
            <h4 className="doc-status-title">
              <svg className="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              {title}
            </h4>
            <span className="doc-status-count">{stats.completed}/{stats.total}</span>
          </div>
          <div className="doc-status-progress">
            <div className="doc-status-progress-bar">
              <div
                className="doc-status-progress-fill"
                style={{
                  width: `${progressPercent}%`,
                  background: progressPercent === 100
                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                    : 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                }}
              />
            </div>
            <span className="doc-status-progress-text">{progressPercent}%</span>
          </div>
        </div>
      )}

      <div className="doc-status-list">
        {items.map((item, index) => (
          <div key={item.id}>
            <div
              className={`doc-status-item row-status-${item.status} ${animatingId === item.id ? 'animating' : ''}`}
              onClick={(e) => handleRowClick(e, item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStatusToggle(item.id);
                }
              }}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="doc-status-item-left">
                <span
                  className={`status-icon-wrapper status-${item.status}`}
                >
                  {statusConfig[item.status].icon}
                </span>
                <div className="doc-status-item-content">
                  <div className="doc-status-item-header">
                    <span className={`doc-status-item-title ${item.status === 'completed' ? 'completed' : ''}`}>
                      {item.title}
                    </span>
                    {item.details && (
                      <button
                        className={`expand-button ${expandedIds.has(item.id) ? 'expanded' : ''}`}
                        onClick={(e) => handleExpandClick(e, item.id)}
                        title={expandedIds.has(item.id) ? '收起详情' : '展开详情'}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {item.description && !expandedIds.has(item.id) && (
                    <span className="doc-status-item-desc">{item.description}</span>
                  )}
                </div>
              </div>
              <div className="doc-status-item-right">
                {item.filePath && (
                  <code className="doc-status-item-path">{item.filePath}</code>
                )}
                <span className={`status-badge status-${item.status}`}>
                  {statusConfig[item.status].icon}
                  <span>{statusConfig[item.status].text}</span>
                </span>
              </div>
            </div>

            {item.details && expandedIds.has(item.id) && (
              <div className="doc-status-details">
                <div className="doc-status-details-content">
                  {Array.isArray(item.details) ? (
                    <ul className="doc-status-details-list">
                      {item.details.map((detail, i) => (
                        <li key={i}>{detail}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{item.details}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="doc-status-footer">
        <div className="doc-status-legend">
          <span className="legend-item">
            <span className="legend-dot" style={{ background: statusConfig.pending.color }} />
            待完成 {stats.pending}
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ background: statusConfig['in-progress'].color }} />
            进行中 {stats.inProgress}
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ background: statusConfig.completed.color }} />
            已完成 {stats.completed}
          </span>
        </div>
        <span className="doc-status-hint">
          <svg className="hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
          </svg>
          点击切换状态 | 点击 ▶ 展开详情
        </span>
      </div>
    </div>
  );
}

export default DocStatusTable;
