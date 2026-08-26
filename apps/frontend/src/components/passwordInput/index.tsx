import { useState } from "react";
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from "@extropy/shared";

import { InputGroup } from "../inputGroup";
import { EyeIcon, EyeSlashIcon } from "../../icons";

type PasswordInputProps = {
  autoCompleteType?: "current-password" | "new-password";
  isRequired?: boolean;
};

export const PasswordInput = ({
  autoCompleteType = "current-password",
  isRequired = true,
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
      isRequired={isRequired}
      endAdornment={
        <button
          className="absolute top-7.5 right-0.5 p-1.5"
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
        </button>
      }
    />
  );
};
