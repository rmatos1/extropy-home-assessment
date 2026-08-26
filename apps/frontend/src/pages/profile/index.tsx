import { FormComponent, InputGroup, PasswordInput } from "../../components";

export function Profile() {
  return (
    <div className="mx-auto my-10 w-md h-full">
      <FormComponent buttonText="Update Profile">
        <InputGroup
          label="Email"
          name="email"
          type="email"
          autoCompleteType="email"
          isRequired
        />

        <PasswordInput autoCompleteType="new-password" isRequired={false} />
      </FormComponent>
    </div>
  );
}
