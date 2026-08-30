import { useEffect } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import toast from "react-hot-toast";

import {
  ActionButton,
  InputGroup,
  PasswordInput,
  LinkComponent,
} from "../../components";
import type { loginAction } from "../../router/actions";

export function Login() {
  const actionData = useActionData<typeof loginAction>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

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
        />

        <PasswordInput />

        <ActionButton
          text="Log in"
          type="submit"
          customClasses="w-full mt-1.5"
          isProcessing={isSubmitting}
          isDisabled={isSubmitting}
        />

        <p className="text-base text-center">
          Don't have an account yet?{" "}
          <LinkComponent to="/signup" text="Create one here" />
        </p>
      </Form>
    </>
  );
}
