import { useState } from "react";
import { X, CheckCircle2, Clock, SkipForward, AlertCircle } from "lucide-react";
import type { FarmTask } from "../../types/lifecycle.types";
import fieldActivityService from "../../services/fieldActivity.service";

interface TaskExecutionModalProps {
  task: FarmTask;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REASON_CODES = [
  { value: "SOIL_TOO_WET", label: "Soil Too Wet / Excess Moisture" },
  { value: "RAIN_INTERFERENCE", label: "Rain Forecast / Unfavorable Weather" },
  { value: "LABOUR_UNAVAILABLE", label: "Labour or Machinery Unavailable" },
  { value: "WATER_SHORTAGE", label: "Canal Water / Electricity Supply Delay" },
  { value: "EQUIPMENT_BREAKDOWN", label: "Equipment / Sprayer Breakdown" },
  { value: "OBSERVED_READY_EARLY", label: "Field Observations Advised Modification" },
  { value: "OTHER", label: "Other Operational Reason" },
];

export const TaskExecutionModal = ({ task, isOpen, onClose, onSuccess }: TaskExecutionModalProps) => {
  const [actionType, setActionType] = useState<"COMPLETED" | "POSTPONED" | "SKIPPED">("COMPLETED");
  const [actionDate, setActionDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [reasonCode, setReasonCode] = useState<string>("SOIL_TOO_WET");
  const [farmerNotes, setFarmerNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await fieldActivityService.executeTask(task.id, {
        action_taken:
          actionType === "COMPLETED"
            ? `Completed ${task.title}`
            : actionType === "POSTPONED"
            ? `Postponed ${task.title}`
            : `Skipped ${task.title}`,
        action_date: actionDate,
        status: actionType,
        reason_code: actionType !== "COMPLETED" ? reasonCode : undefined,
        farmer_notes: farmerNotes || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to record field activity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800 uppercase tracking-wider">
                {task.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">#{task.task_code}</span>
            </div>
            <h2 className="mt-1 text-base font-bold text-slate-900">{task.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Type Tabs */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setActionType("COMPLETED")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
              actionType === "COMPLETED"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <CheckCircle2 size={14} />
            Completed
          </button>

          <button
            type="button"
            onClick={() => setActionType("POSTPONED")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
              actionType === "POSTPONED"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Clock size={14} />
            Postpone
          </button>

          <button
            type="button"
            onClick={() => setActionType("SKIPPED")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
              actionType === "SKIPPED"
                ? "bg-slate-700 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <SkipForward size={14} />
            Skip
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {actionType === "POSTPONED" ? "New Rescheduled Date" : "Date Action Was Taken"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              min={actionType === "POSTPONED" ? new Date().toISOString().split("T")[0] : undefined}
              max={actionType === "COMPLETED" ? new Date().toISOString().split("T")[0] : undefined}
              value={actionDate}
              onChange={(e) => setActionDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              {actionType === "POSTPONED"
                ? "Select the new scheduled target date for this field activity."
                : `Original planned target was ${task.target_date}.`}
            </p>
          </div>

          {/* Reason Code Dropdown (Required if Postponed or Skipped) */}
          {actionType !== "COMPLETED" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Authoritative Reason <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
              >
                {REASON_CODES.map((rc) => (
                  <option key={rc.value} value={rc.value}>
                    {rc.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Farmer Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Field Notes / Observations {actionType === "SKIPPED" && <span className="text-red-500">*</span>}
            </label>
            <textarea
              rows={2}
              required={actionType === "SKIPPED"}
              placeholder="E.g. Observed slight yellowing in lower leaves; delayed second spray by 2 days."
              value={farmerNotes}
              onChange={(e) => setFarmerNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-green-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-green-800 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? "Recording Activity..." : "Confirm & Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskExecutionModal;
