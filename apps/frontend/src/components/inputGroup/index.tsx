type InputGroupProps = {
  label: string;
  name: string;
  type: "text" | "email" | "password";
  isRequired?: boolean;
  autoCompleteType?: string;
  endAdornment?: React.ReactNode;
  minLength?: number;
  maxLength?: number;
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
      />
      {endAdornment}
    </div>
  );
};
