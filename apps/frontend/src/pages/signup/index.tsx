import {
  FormComponent,
  InputGroup,
  PasswordInput,
  LinkComponent,
} from "../../components";

export function Signup() {
  return (
    <FormComponent
      title="Signup"
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
  );
}
