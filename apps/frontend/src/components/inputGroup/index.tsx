import { forwardRef, type ChangeEvent, type ReactNode } from "react";

type InputGroupProps = {
  label?: string;
  name: string;
  type: "text" | "email" | "password" | "number" | "date";
  defaultValue?: string;
  autoCompleteType?: string;
  endAdornment?: ReactNode;
  isRequired?: boolean;
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
  min?: string;
  max?: string;
  form?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const InputGroup = forwardRef<HTMLInputElement, InputGroupProps>(
  function InputGroup(
    {
      label,
      name,
      type,
      defaultValue,
      autoCompleteType,
      endAdornment,
      isRequired = true,
      minLength,
      maxLength,
      inputMode,
      pattern,
      min,
      max,
      form,
      value,
      onChange,
    },
    ref
  ) {
    return (
      <div className="relative flex flex-col gap-1">
        {label && (
          <label htmlFor={name} className="text-md text-gray-500">
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={name}
          className="h-10 w-full rounded-lg border border-gray-300 text-base text-gray-900 indent-3"
          name={name}
          type={type}
          defaultValue={defaultValue}
          autoComplete={autoCompleteType}
          required={isRequired}
          minLength={minLength}
          maxLength={maxLength}
          inputMode={inputMode}
          pattern={pattern}
          min={min}
          max={max}
          form={form}
          value={value}
          onChange={onChange}
        />

        {endAdornment}
      </div>
    );
  }
);
