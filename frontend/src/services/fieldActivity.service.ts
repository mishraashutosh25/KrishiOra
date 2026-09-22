import api from "./api";
import type { ExecuteActivityInput } from "../types/lifecycle.types";

export const fieldActivityService = {
  // Execute a specific task (Complete, Postpone, Skip, Unable to complete)
  async executeTask(taskId: string, input: ExecuteActivityInput) {
    const idempotencyKey = input.idempotency_key || `ui_${taskId}_${input.status}_${Date.now()}`;
    const payload = {
      actionTaken: input.action_taken,
      actionDate: input.action_date,
      status: input.status,
      reasonCode: input.reason_code,
      farmerNotes: input.farmer_notes,
      idempotencyKey,
    };
    const res = await api.post<{ success: boolean; data: any }>(
      `/field-activities/tasks/${taskId}/execute`,
      payload
    );
    return res.data.data;
  },

  // Postpone task shortcut
  async postponeTask(taskId: string, actionDate: string, reasonCode: string, notes?: string) {
    return this.executeTask(taskId, {
      action_taken: "Postponed field activity",
      action_date: actionDate,
      status: "POSTPONED",
      reason_code: reasonCode,
      farmer_notes: notes,
    });
  },

  // Log general field observation without a scheduled task
  async logObservation(cropCycleId: string, actionTaken: string, actionDate: string, notes?: string) {
    const res = await api.post<{ success: boolean; data: any }>(
      "/field-activities/observations",
      {
        cropCycleId,
        actionTaken,
        actionDate,
        farmerNotes: notes,
        idempotencyKey: `ui_obs_${cropCycleId}_${Date.now()}`,
      }
    );
    return res.data.data;
  },
};

export default fieldActivityService;
