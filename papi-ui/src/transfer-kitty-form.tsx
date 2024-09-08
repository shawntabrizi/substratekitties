import * as Form from "@radix-ui/react-form";
import { Button, Flex, TextField } from "@radix-ui/themes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { transferKitty } from "./api/methods";
import { useKittyContext } from "./context/kitty-context";
import { cn } from "./utils";

interface Props {
  kittyDna: string;
}

interface FormInputs {
  newOwner: string;
}

export function TransferKittyForm({ kittyDna }: Props) {
  const { register, handleSubmit, reset, formState } = useForm<FormInputs>();
  const { polkadotSigner } = useKittyContext();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey: ["transfer-kitty", kittyDna],
    mutationFn: transferKitty,
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
    if (!polkadotSigner) {
      toast.error("Please connect your wallet");
      return;
    }
    mutate({ polkadotSigner, kittyId: kittyDna, newOwner: data.newOwner });

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
