/**
 * 文档状态表格组件 - 状态管理 Hooks
 * 处理状态切换、localStorage 存储和展开/折叠逻辑
 */
import { useState, useEffect, useCallback } from 'react';
import type { DocStatusItem } from './types';

/**
 * 状态循环顺序
 */
const statusCycle = ['pending', 'in-progress', 'completed'] as const;

/**
 * 文档状态表格状态管理 Hook
 * @param initialItems 初始文档列表
 * @param storageKey localStorage 键名
 * @returns 状态和方法
 */
export function useDocStatusTable(initialItems: DocStatusItem[], storageKey?: string) {
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

  return {
    items,
    animatingId,
    expandedIds,
    stats,
    progressPercent,
    handleStatusToggle,
    handleExpandToggle,
  };
}
