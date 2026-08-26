import {
  FormComponent,
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
      <FormComponent
        buttonText="Log in"
        footerAdornment={
          <p className="text-base text-center">
            Don't have an account yet?{" "}
            <LinkComponent to="/signup" text="Create one here" />
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

        <PasswordInput />
      </FormComponent>
    </>
  );
}
