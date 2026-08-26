import { FormComponent, InputGroup } from "../../components";

export function AddCategory() {
  return (
    <div className="mx-auto my-10 w-md h-full">
      <FormComponent buttonText="Add Category">
        <InputGroup label="Category Name" name="name" type="text" isRequired />
      </FormComponent>
    </div>
  );
}
