import * as Form from "@radix-ui/react-form";
import { Button, Flex, TextField } from "@radix-ui/themes";
import { pending } from "@reactive-dot/core";
import { useMutation } from "@reactive-dot/react";
import { Binary } from "polkadot-api";
import { useForm } from "react-hook-form";
import { cn } from "./utils";

interface Props {
  kittyDna: string;
}

interface FormInputs {
  newOwner: string;
}

export function TransferKittyForm({ kittyDna }: Props) {
  const { register, handleSubmit, getValues, formState } =
    useForm<FormInputs>();

  const [transferState, transfer] = useMutation((tx) =>
    tx.Kitties.transfer({
      to: getValues().newOwner,
      kitty_id: Binary.fromHex(kittyDna),
    })
  );

  return (
    <Form.Root onSubmit={handleSubmit(() => transfer())}>
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
              formState.errors.newOwner ? "text-red-500" : "hidden"
            )}
          >
            {formState.errors.newOwner?.message}
          </Form.Message>
        </Form.Field>
        <Button type="submit" loading={transferState === pending}>
          Transfer Kitty
        </Button>
      </Flex>
    </Form.Root>
  );
}
