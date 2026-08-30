import { useEffect } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import toast from "react-hot-toast";

import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@extropy/shared";

import {
  ActionButton,
  InputGroup,
  PasswordInput,
  LinkComponent,
} from "../../components";

import type { signupAction } from "../../router/actions";

export function Signup() {
  const actionData = useActionData<typeof signupAction>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <>
      <div className="flex h-20 w-full items-center justify-center rounded-t-xl bg-gradient-to-b from-indigo-800 to-indigo-900">
        <h1 className="text-xl font-bold text-white">Create your account</h1>
      </div>

      <Form method="post" className="box-border flex w-full flex-col gap-4 p-3">
        <p className="text-center text-base">
          Enter your email and a password with at least{" "}
          <span className="font-bold">{MIN_PASSWORD_LENGTH}</span> and at most{" "}
          <span className="font-bold">{MAX_PASSWORD_LENGTH}</span> characters.
        </p>

        <InputGroup
          label="Email"
          name="email"
          type="email"
          autoCompleteType="email"
        />

        <PasswordInput autoCompleteType="new-password" />

        <ActionButton
          text="Sign up"
          type="submit"
          customClasses="mt-1.5 w-full"
          isProcessing={isSubmitting}
          isDisabled={isSubmitting}
        />

        <p className="text-center text-base">
          Already have an account?{" "}
          <LinkComponent to="/login" text="Log in here" />
        </p>
      </Form>
    </>
  );
}
