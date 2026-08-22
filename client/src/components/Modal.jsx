import { useState } from "react";

/**
 * A small modal used in place of window.prompt()/confirm() for a nicer,
 * on-brand experience. Renders a title, optional description, an optional
 * text input, and Confirm/Cancel buttons.
 */
export default function Modal({
  title,
  description,
  withInput = false,
  inputLabel = "Comment",
  defaultValue = "",
  confirmLabel = "Confirm",
  tone = "primary",
  onConfirm,
  onCancel,
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
      <div className="card w-full max-w-sm pop-in">
        <h3 className="font-medium text-lg">{title}</h3>
        {description && <p className="text-sm text-slate mt-1">{description}</p>}

        {withInput && (
          <div className="mt-4">
            <label className="label">{inputLabel}</label>
            <input
              className="input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
          </div>
        )}

        <div className="flex gap-2 justify-end mt-6">
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={tone === "danger" ? "btn-danger" : "btn-primary"}
            onClick={() => onConfirm(value)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
