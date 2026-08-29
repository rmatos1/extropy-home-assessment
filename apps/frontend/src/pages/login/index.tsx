import { Form } from "react-router";

import {
  ActionButton,
  InputGroup,
  PasswordInput,
  LinkComponent,
} from "../../components";

export function Login() {
  return (
    <>
      <div className="flex items-center justify-center bg-gradient-to-b from-blue-800 to-blue-900 w-full h-20 rounded-t-xl">
        <h1 className="text-white font-bold text-xl">Access your account</h1>
      </div>

      <Form method="post" className="w-full box-border p-3 flex flex-col gap-4">
        <InputGroup
          label="Email"
          name="email"
          type="email"
          autoCompleteType="email"
          isRequired
        />

        <PasswordInput />

        <ActionButton
          text="Log in"
          type="submit"
          customClasses="w-full mt-1.5"
        />

        <p className="text-base text-center">
          Don't have an account yet?{" "}
          <LinkComponent to="/signup" text="Create one here" />
        </p>
      </Form>
    </>
  );
}
