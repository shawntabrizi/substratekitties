import * as Form from "@radix-ui/react-form";
import { Button, Flex, TextField } from "@radix-ui/themes";
import { SubmitHandler, useForm } from "react-hook-form";
import { cn } from "./utils";

interface Props {
  kittyDna: string;
}

interface FormInputs {
  newOwner: string;
}

export function TransferKittyForm({ kittyDna }: Props) {
  const { register, handleSubmit, reset, formState } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    // TODO: Implement transfer logic
    console.log(`Transferring kitty ${kittyDna} to ${data.newOwner}`);
    reset();
  };

  return (
    <Form.Root onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap="2">
        <Form.Field name="newOwner">
          <Form.Label>New Owner</Form.Label>
          <Form.Control
            {...register("newOwner", { required: true })}
            placeholder="New owner address"
            asChild
          >
            <TextField.Root type="text" />
          </Form.Control>
          <Form.Message
            className={cn(
              formState.errors.newOwner ? "text-destructive" : "hidden"
            )}
          >
            {formState.errors.newOwner?.message}
          </Form.Message>
        </Form.Field>
        <Button type="submit">Transfer Kitty</Button>
      </Flex>
    </Form.Root>
  );
}
