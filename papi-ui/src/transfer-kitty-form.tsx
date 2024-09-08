import * as Form from "@radix-ui/react-form";
import { Button, Flex, TextField } from "@radix-ui/themes";
import { SubmitHandler, useForm } from "react-hook-form";
import { cn } from "./utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FixedSizeBinary } from "polkadot-api";
import { useKittyContext } from "./context/kitty-context";
import { toast } from "sonner";

interface Props {
  kittyDna: string;
}

interface FormInputs {
  newOwner: string;
}

export function TransferKittyForm({ kittyDna }: Props) {
  const { register, handleSubmit, reset, formState } = useForm<FormInputs>();
  const { polkadotSigner, api } = useKittyContext();
  const queryClient = useQueryClient();
  const { mutate: transferKitty, isPending } = useMutation({
    mutationKey: ["transfer-kitty", kittyDna],
    mutationFn: async (newOwner: string) =>
      api.tx.Kitties.transfer({
        kitty_id: FixedSizeBinary.fromHex(kittyDna),
        to: newOwner,
      }).signAndSubmit(polkadotSigner!),
    onSuccess: async (response) => {
      console.log("Kitty transferred", response);
      if (response.ok) {
        toast.success("Kitty transferred");
      } else {
        toast.error(
          "Kitty transfer failed, check the console for more information"
        );
      }
      queryClient.invalidateQueries({ queryKey: ["kitties"] });
    },
  });

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    transferKitty(data.newOwner);

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
        <Button type="submit" loading={isPending}>
          Transfer Kitty
        </Button>
      </Flex>
    </Form.Root>
  );
}
