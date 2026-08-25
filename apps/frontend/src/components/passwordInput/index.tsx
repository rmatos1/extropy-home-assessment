import { useState } from "react";
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from "@extropy/shared";

import { InputGroup } from "../inputGroup";

type PasswordInputProps = {
  autoCompleteType?: "current-password" | "new-password";
};

export const PasswordInput = ({
  autoCompleteType = "current-password",
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <InputGroup
      label="Password"
      name="password"
      type={showPassword ? "text" : "password"}
      autoCompleteType={autoCompleteType}
      minLength={MIN_PASSWORD_LENGTH}
      maxLength={MAX_PASSWORD_LENGTH}
      isRequired
      endAdornment={
        <button
          className="absolute top-8 right-1 text-gray-500 bg-gray-100 py-1 px-3 text-md"
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      }
    />
  );
};
