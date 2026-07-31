// Passwort-Feld mit Auge-Icon zum Ein-/Ausblenden der Eingabe.
'use client';

import { useState } from 'react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  className,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  className: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className={`${className} pr-11`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Passwort verbergen' : 'Passwort anzeigen'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition hover:text-text"
      >
        {visible ? <IconEyeOff size={18} stroke={1.75} /> : <IconEye size={18} stroke={1.75} />}
      </button>
    </div>
  );
}
