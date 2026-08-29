type InputGroupProps = {
  label?: string;
  name: string;
  type: "text" | "email" | "password" | "number" | "date";
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isRequired?: boolean;
  autoCompleteType?: string;
  endAdornment?: React.ReactNode;
  minLength?: number;
  maxLength?: number;
  inputMode?:
    | "text"
    | "email"
    | "search"
    | "tel"
    | "url"
    | "none"
    | "numeric"
    | "decimal";
  pattern?: string;
  max?: string;
};

export const InputGroup = ({
  label,
  name,
  type,
  value,
  onChange,
  isRequired,
  autoCompleteType,
  endAdornment,
  minLength,
  maxLength,
  inputMode,
  pattern,
  max,
}: InputGroupProps) => {
  return (
    <div className="relative flex flex-col gap-1">
      {label && (
        <label htmlFor={name} className="text-md text-gray-500">
          {label}
        </label>
      )}

      <input
        id={name}
        className="h-10 rounded-lg border border-gray-300 text-base text-gray-900 indent-3"
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoCompleteType}
        required={isRequired}
        minLength={minLength}
        maxLength={maxLength}
        inputMode={inputMode}
        pattern={pattern}
        max={max}
      />

      {endAdornment}
    </div>
  );
};
