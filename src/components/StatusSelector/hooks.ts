/**
 * 状态选择器组件 - 状态管理 Hooks
 * 处理状态切换和 localStorage 存储逻辑
 */
import { useState, useEffect, useCallback } from 'react';
import type { StatusItem, ProgressStats } from './types';

/**
 * 状态循环顺序
 */
const statusOrder = ['pending', 'in-progress', 'completed'] as const;

/**
 * 状态选择器状态管理 Hook
 * @param initialItems 初始状态项列表
 * @param storageKey localStorage 键名
 * @returns 状态和方法
 */
export function useStatusSelector(initialItems: StatusItem[], storageKey?: string) {
  // 状态项列表状态
  const [items, setItems] = useState<StatusItem[]>(initialItems);

  /**
   * 从 localStorage 加载状态
   */
  useEffect(() => {
    const saved = localStorage.getItem(storageKey || 'knowledge-base-status');
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
  const handleStatusChange = useCallback((id: string) => {
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
      localStorage.setItem(storageKey || 'knowledge-base-status', JSON.stringify(statusMap));

      return newItems;
    });
  }, [storageKey]);

  /**
   * 获取进度信息
   * @returns 进度统计信息
   */
  const getProgress = useCallback((): ProgressStats => {
    const total = items.length;
    const completed = items.filter((i) => i.status === 'completed').length;
    const inProgress = items.filter((i) => i.status === 'in-progress').length;
    return { total, completed, inProgress, pending: total - completed - inProgress };
  }, [items]);

  return {
    items,
    handleStatusChange,
    getProgress,
  };
}
