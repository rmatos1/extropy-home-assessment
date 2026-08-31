import { useEffect, useRef } from "react";
import { useActionData, useNavigation } from "react-router";
import toast from "react-hot-toast";

import { useAuthStore } from "../../store";
import { updateProfileAction } from "../../router/actions";

export function useProfileHelper() {
  const passwordFormRef = useRef<HTMLFormElement>(null);

  const email = useAuthStore((state) => state.userEmail);
  const actionData = useActionData<typeof updateProfileAction>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";
  const submittedAction = navigation.formData?.get("action");

  const isUpdatingEmail = isSubmitting && submittedAction === "email";

  const isUpdatingPassword = isSubmitting && submittedAction === "password";

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }

    if (actionData?.success) {
      toast.success(`Your ${actionData.updated} was updated successfully!`);

      if (actionData.updated === "password") {
        passwordFormRef.current?.reset();
      }
    }
  }, [actionData]);

  return {
    passwordFormRef,
    email,
    isSubmitting,
    isUpdatingEmail,
    isUpdatingPassword,
  };
}
