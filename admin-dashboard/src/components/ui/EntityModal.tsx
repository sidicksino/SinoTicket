import { useEffect, useMemo, useState } from "react";

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "number" | "email" | "select";
  options?: string[];
}

interface EntityModalProps<T extends object> {
  mode: "create" | "edit";
  title: string;
  fields: FieldDef[];
  initialValue?: T;
  onClose: () => void;
  onSave: (values: Omit<T, "id">) => void;
}

function serializeValue(raw: string, type: FieldDef["type"]) {
  if (type === "number") {
    return Number(raw);
  }
  return raw;
}

export function EntityModal<T extends object>({
  mode,
  title,
  fields,
  initialValue,
  onClose,
  onSave,
}: EntityModalProps<T>) {
  const defaultState = useMemo(() => {
    const state: Record<string, string> = {};
    fields.forEach((field) => {
      const value = initialValue
        ? (initialValue as Record<string, unknown>)[field.key]
        : undefined;
      state[field.key] =
        value === undefined || value === null ? "" : String(value);
    });
    return state;
  }, [fields, initialValue]);

  const [values, setValues] = useState<Record<string, string>>(defaultState);

  useEffect(() => {
    setValues(defaultState);
  }, [defaultState]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = fields.reduce<Record<string, unknown>>((acc, field) => {
      acc[field.key] = serializeValue(values[field.key], field.type);
      return acc;
    }, {});

    onSave(payload as Omit<T, "id">);
  }

  return (
    <div className="fixed inset-0 z-40 grid place-content-center bg-black/65 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full min-w-[min(90vw,36rem)] rounded-2xl border border-white/10 bg-slate-900 p-5"
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-300">
          {mode === "create" ? "Add a new record" : "Edit existing record"}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <label key={field.key} className="text-sm">
              <span className="mb-1 block text-slate-200">{field.label}</span>
              {field.type === "select" ? (
                <select
                  required
                  value={values[field.key]}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-white/15 bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-0 transition focus:border-cyan-400"
                >
                  <option value="" disabled>
                    Choose...
                  </option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  required
                  type={field.type ?? "text"}
                  value={values[field.key]}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-white/15 bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-0 transition focus:border-cyan-400"
                />
              )}
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/20 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
