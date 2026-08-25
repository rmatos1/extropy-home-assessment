import {
  FormComponent,
  InputGroup,
  PasswordInput,
  LinkComponent,
} from "../../components";

export function Login() {
  return (
    <FormComponent
      title="Login"
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
  );
}
