type InputGroupProps = {
  label: string;
  name: string;
  type: "text" | "email" | "password" | "number" | "date";
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
    <div className="flex flex-col gap-1 relative">
      <label htmlFor={name} className="text-md text-gray-500">
        {label}
      </label>
      <input
        id={name}
        className="border border-gray-300 h-10 rounded-lg text-gray-900 text-base indent-3"
        name={name}
        type={type}
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
