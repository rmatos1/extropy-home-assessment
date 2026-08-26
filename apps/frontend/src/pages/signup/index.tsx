import {
  FormComponent,
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
      <FormComponent
        buttonText="Sign up"
        footerAdornment={
          <p className="text-base text-center">
            Already have an account?{" "}
            <LinkComponent to="/login" text="Log in here" />
          </p>
        }
      >
        <InputGroup
          label="Email"
          name="email"
          type="email"
          autoCompleteType="email"
          isRequired
        />

        <PasswordInput autoCompleteType="new-password" />
      </FormComponent>
    </>
  );
}
