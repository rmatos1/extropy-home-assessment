import { Form } from "react-router";

import {
  ActionButton,
  InputGroup,
  PasswordInput,
  LinkComponent,
} from "../../components";

export function Signup() {
  return (
    <>
      <div className="flex items-center justify-center bg-gradient-to-b from-indigo-800 to-indigo-900 w-full h-20 rounded-t-xl">
        <h1 className="text-white font-bold text-xl">Create your account</h1>
      </div>

      <Form method="post" className="w-full box-border p-3 flex flex-col gap-4">
        <InputGroup
          label="Email"
          name="email"
          type="email"
          autoCompleteType="email"
          isRequired
        />

        <PasswordInput autoCompleteType="new-password" />

        <ActionButton
          text="Sign up"
          type="submit"
          customClasses="w-full mt-1.5"
        />

        <p className="text-base text-center">
          Already have an account?{" "}
          <LinkComponent to="/login" text="Log in here" />
        </p>
      </Form>
    </>
  );
}
