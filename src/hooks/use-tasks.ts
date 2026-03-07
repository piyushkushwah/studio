"use client";

import { useTaskContext } from '@/components/task-provider';

/**
 * Hook to interact with the global task state.
 * This is a wrapper around TaskContext to maintain the existing API.
 */
export function useTasks() {
  return useTaskContext();
}
