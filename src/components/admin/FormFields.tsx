import { useId } from 'react';
import { inputClass as inputCls } from '@/components/ui/TextInput';
import { statusColors } from '@/lib/project-utils';

export function Field({
  label,
  value,
  onChange,
  required,
  textarea,
  rows,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  textarea?: boolean;
  rows?: number;
  type?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block font-mono text-xs text-bone uppercase mb-1">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          rows={rows ?? 3}
          className={inputCls + ' resize-y'}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={inputCls}
        />
      )}
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block font-mono text-xs text-bone uppercase mb-1">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`font-mono text-xs ${statusColors[status as keyof typeof statusColors] ?? 'text-dust'}`}
    >
      {status.toUpperCase()}
    </span>
  );
}
