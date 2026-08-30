import { Form } from "react-router";

import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@extropy/shared";

import { ActionButton, InputGroup, PasswordInput } from "../../components";

import { useProfileHelper } from "./useProfileHelper.hook";

export function Profile() {
  const {
    passwordFormRef,
    email,
    isSubmitting,
    isUpdatingEmail,
    isUpdatingPassword,
  } = useProfileHelper();

  return (
    <div className="m-4 flex flex-1 flex-col gap-4 rounded-xl bg-white p-4">
      <div className="mx-auto my-10 flex w-md flex-col gap-8">
        <p className="text-md leading-6 text-gray-600">
          Update your email and/or your password. If you want to change your
          password, it must be between {MIN_PASSWORD_LENGTH} and{" "}
          {MAX_PASSWORD_LENGTH} characters long.
        </p>

        <Form method="post" className="mt-2 flex flex-col gap-4">
          <InputGroup
            label="Email"
            name="email"
            type="email"
            autoCompleteType="email"
            defaultValue={email}
          />

          <ActionButton
            text="Update email"
            type="submit"
            name="action"
            value="email"
            isDisabled={isSubmitting}
            isProcessing={isUpdatingEmail}
          />
        </Form>

        <Form
          method="post"
          className="mt-4 flex flex-col gap-4"
          ref={passwordFormRef}
        >
          <PasswordInput autoCompleteType="new-password" label="New password" />

          <ActionButton
            text="Update password"
            type="submit"
            name="action"
            value="password"
            isDisabled={isSubmitting}
            isProcessing={isUpdatingPassword}
          />
        </Form>
      </div>
    </div>
  );
}
