import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { LucideIcon } from 'lucide-react';

interface FormInputProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: LucideIcon;
  disabled?: boolean;
  autoComplete?: string;
}

export function FormInput({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  icon: Icon,
  disabled = false,
  autoComplete,
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="pl-10"
          disabled={disabled}
          autoComplete={autoComplete}
        />
      </div>
    </div>
  );
}
