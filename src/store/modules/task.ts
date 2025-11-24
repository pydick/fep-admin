import { defineStore } from "pinia";
import { store, storageLocal } from "../utils";

export const taskIdKey = "task-id";

export const useTaskStore = defineStore("task", {
  state: () => ({
    taskId: storageLocal().getItem(taskIdKey) ?? ""
  }),
  getters: {
    getTaskId(state) {
      return state.taskId;
    }
  },
  actions: {
    SET_TASK_ID(taskId: string) {
      this.taskId = taskId;
      storageLocal().setItem(taskIdKey, taskId);
    },
    CLEAR_TASK_ID() {
      this.taskId = "";
      storageLocal().removeItem(taskIdKey);
    }
  }
});

export function useTaskStoreHook() {
  return useTaskStore(store);
}
