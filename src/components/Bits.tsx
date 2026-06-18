import { useRef, useState } from "react";
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon, UploadIcon } from "./Icons";

export const Dropzone = ({
  title,
  subtitle,
  accept,
  disabled,
  onFile,
}: {
  title: string;
  subtitle: string;
  accept: string;
  disabled?: boolean;
  onFile: (file: File) => void;
}) => {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`dropzone ${drag ? "drag" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (disabled) return;
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      aria-disabled={disabled}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <div className="dz-icon">
        <UploadIcon size={26} />
      </div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  );
};

export const CopyButton = ({ value, label }: { value: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className={`copy-btn ${copied ? "copied" : ""}`}
      title={label}
      aria-label={label}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
    >
      {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
    </button>
  );
};

function maskHash(value: string): string {
  if (value.length <= 16) return "•".repeat(value.length);
  return `${value.slice(0, 8)}${"•".repeat(12)}${value.slice(-8)}`;
}

// Campo de datos. Con `sensitive`, el valor se muestra enmascarado, no se
// puede seleccionar ni copiar (la huella es un dato privado del documento).
export const Field = ({
  label,
  value,
  copyValue,
  sensitive,
}: {
  label: string;
  value: string;
  copyValue?: string;
  sensitive?: boolean;
}) => {
  const [revealed, setRevealed] = useState(false);

  if (sensitive) {
    return (
      <div className="field">
        <div className="field-body">
          <div className="field-label">{label}</div>
          <div
            className="field-value sensitive"
            onCopy={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            aria-label={`${label} (protegida)`}
          >
            {revealed ? value : maskHash(value)}
          </div>
        </div>
        <button
          className="copy-btn"
          title={revealed ? "Ocultar" : "Mostrar"}
          aria-label={revealed ? "Ocultar huella" : "Mostrar huella"}
          onClick={() => setRevealed(!revealed)}
        >
          {revealed ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
        </button>
      </div>
    );
  }

  return (
    <div className="field">
      <div className="field-body">
        <div className="field-label">{label}</div>
        <div className="field-value">{value}</div>
      </div>
      {copyValue !== undefined && (
        <CopyButton value={copyValue} label={`Copiar ${label.toLowerCase()}`} />
      )}
    </div>
  );
};
