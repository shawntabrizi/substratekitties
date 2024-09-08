import * as Form from "@radix-ui/react-form";
import { Button, Flex, TextField } from "@radix-ui/themes";
import { SubmitHandler, useForm } from "react-hook-form";
import { cn } from "./utils";
import { useKittyContext } from "./context/kitty-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import polkadotApi from "./papi-client";
import { FixedSizeBinary } from "polkadot-api";
import { toast } from "sonner";

interface Props {
  kittyDna: string;
  currentPrice?: bigint;
}

interface FormInputs {
  price: string;
}

export function SetPriceForm({ kittyDna, currentPrice }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      price: currentPrice?.toString() || "",
    },
  });
  const { polkadotSigner } = useKittyContext();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey: ["setPrice", kittyDna],
    mutationFn: async (price?: bigint) =>
      polkadotApi.tx.Kitties.set_price({
        kitty_id: FixedSizeBinary.fromHex(kittyDna),
        new_price: price,
      }).signAndSubmit(polkadotSigner!),
    onSuccess: (response) => {
      console.log("Kitty price set", response);
      if (response.ok) {
        toast.success("Kitty price set");
      } else {
        toast.error(
          "Kitty price set failed, check the console for more information"
        );
      }
      queryClient.invalidateQueries({ queryKey: ["kitties"] });
    },
  });

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    mutate(BigInt(data.price));
  };

  const handleRemoveFromMarket = () => {
    mutate(undefined);
  };

  return (
    <Form.Root onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap="2">
        <Form.Field name="price">
          <Form.Label>Price</Form.Label>
          <Form.Control {...register("price", { required: true })} asChild>
            <TextField.Root type="number" placeholder="Set price" />
          </Form.Control>
          <Form.Message
            className={cn(errors.price ? "text-destructive" : "hidden")}
          >
            {errors.price?.message}
          </Form.Message>
        </Form.Field>
        <Button type="submit" loading={isPending}>
          Set Price
        </Button>
        {currentPrice !== null && (
          <Button
            type="button"
            onClick={handleRemoveFromMarket}
            variant="soft"
            loading={isPending}
          >
            Remove from Market
          </Button>
        )}
      </Flex>
    </Form.Root>
  );
}
