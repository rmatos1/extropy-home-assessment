import { Form } from "react-router";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@extropy/shared";

import { ActionButton, InputGroup, PasswordInput } from "../../components";

export function Profile() {
  return (
    <div className="m-4 flex flex-1 flex-col gap-4 rounded-xl border-box bg-white p-4">
      <div className="mx-auto my-10 h-full w-md">
        <p className="mt-2 text-md leading-6 text-gray-600">
          Update your email and/or password. The new password must have at least{" "}
          {MIN_PASSWORD_LENGTH} and at most {MAX_PASSWORD_LENGTH} characters.
        </p>

        <Form method="post" className="mt-6 flex w-full flex-col gap-4">
          <InputGroup
            label="Email"
            name="email"
            type="email"
            autoCompleteType="email"
            isRequired
          />

          <PasswordInput
            autoCompleteType="new-password"
            label="New password"
            isRequired={false}
          />

          <ActionButton text="Update Profile" type="submit" />
        </Form>
      </div>
    </div>
  );
}
