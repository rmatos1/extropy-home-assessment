import type React from "react";
import { Form } from "react-router";

type FormInput = {
  children: React.ReactNode;
  title: string;
  buttonText: string;
  footerAdornment?: React.ReactNode;
};

export const FormComponent = ({
  children,
  title,
  buttonText,
  footerAdornment,
}: FormInput) => {
  return (
    <Form method="post" className="w-full box-border p-3 flex flex-col gap-4">
      <h1 className="text-center text-2xl font-bold text-gray-600">{title}</h1>

      {children}

      <button
        className="bg-linear-to-b from-blue-400 to-blue-500 w-full h-12 font-bold text-white rounded-md cursor-pointer hover:from-blue-500 hover:to-blue-400"
        type="submit"
      >
        {buttonText}
      </button>

      {footerAdornment}
    </Form>
  );
};
