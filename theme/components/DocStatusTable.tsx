/**
 * 文档状态表格组件
 * 用于显示和管理知识库文档的生成状态
 */
import React, { useState, useEffect, useCallback } from 'react';
import './doc-status-table.css';

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
interface DocStatusTableProps {
  items: DocStatusItem[];    // 文档列表
  title?: string;            // 表格标题
  storageKey?: string;       // localStorage 键名
}

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
 * 状态循环顺序
 */
const statusCycle = ['pending', 'in-progress', 'completed'] as const;

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
  // 文档列表状态
  const [items, setItems] = useState<DocStatusItem[]>(initialItems);
  // 动画状态（用于状态切换时的动画效果）
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  // 展开状态集合（存储展开的文档 ID）
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  /**
   * 初始化时展开所有非完成状态的项目
   */
  useEffect(() => {
    const expanded = new Set<string>();
    initialItems.forEach(item => {
      if (item.status !== 'completed') {
        expanded.add(item.id);
      }
    });
    setExpandedIds(expanded);
  }, [initialItems]);

  /**
   * 从 localStorage 加载状态
   */
  useEffect(() => {
    if (!storageKey) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const updatedItems = initialItems.map((item) => ({
          ...item,
          status: (parsed[item.id] as DocStatusItem['status']) || 'pending',
        }));
        setItems(updatedItems);
        
        // 根据加载的状态更新展开状态
        const expanded = new Set<string>();
        updatedItems.forEach(item => {
          if (item.status !== 'completed') {
            expanded.add(item.id);
          }
        });
        setExpandedIds(expanded);
      } catch (e) {
        console.warn('Failed to parse saved status:', e);
      }
    }
  }, [storageKey, initialItems]);

  /**
   * 切换文档状态
   * @param id 文档 ID
   */
  const handleStatusToggle = useCallback((id: string) => {
    setAnimatingId(id);
    setItems((current) => {
      const newItems = current.map((item) => {
        if (item.id === id) {
          const currentIndex = statusCycle.indexOf(item.status);
          const nextIndex = (currentIndex + 1) % statusCycle.length;
          return { ...item, status: statusCycle[nextIndex] };
        }
        return item;
      });

      // 根据新状态更新展开状态
      const item = newItems.find(i => i.id === id);
      if (item) {
        setExpandedIds((current) => {
          const newSet = new Set(current);
          if (item.status === 'completed') {
            // 已完成的项目自动折叠
            newSet.delete(id);
          } else {
            // 非完成的项目自动展开
            newSet.add(id);
          }
          return newSet;
        });
      }

      // 保存状态到 localStorage
      if (storageKey) {
        const statusMap: Record<string, DocStatusItem['status']> = {};
        newItems.forEach((item) => {
          statusMap[item.id] = item.status;
        });
        localStorage.setItem(storageKey, JSON.stringify(statusMap));
      }

      return newItems;
    });

    // 300ms 后移除动画状态
    setTimeout(() => setAnimatingId(null), 300);
  }, [storageKey]);

  /**
   * 切换展开/折叠状态
   * @param id 文档 ID
   */
  const handleExpandToggle = useCallback((id: string) => {
    setExpandedIds((current) => {
      const newSet = new Set(current);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  /**
   * 统计信息
   */
  const stats = {
    total: items.length,
    completed: items.filter((i) => i.status === 'completed').length,
    inProgress: items.filter((i) => i.status === 'in-progress').length,
    pending: items.filter((i) => i.status === 'pending').length,
  };

  /**
   * 完成进度百分比
   */
  const progressPercent = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

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
