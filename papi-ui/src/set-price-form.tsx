import * as Form from "@radix-ui/react-form";
import { Button, Flex, TextField } from "@radix-ui/themes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { setPrice } from "./api/methods";
import { useKittyContext } from "./context/use-kitty-context";
import { cn } from "./utils";

interface Props {
  kittyDna: string;
  currentPrice?: string;
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
    mutationFn: setPrice,
    onSuccess: async (response) => {
      console.log("Kitty price set", response);
      if (response.ok) {
        toast.success("Kitty price set");
      } else {
        toast.error(
          "Kitty price set failed, check the console for more information"
        );
      }
      await queryClient.invalidateQueries({ queryKey: ["kitties"] });
    },
  });

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    mutate({ polkadotSigner, dna: kittyDna, price: BigInt(data.price) });
  };

  const handleRemoveFromMarket = () => {
    mutate({ polkadotSigner, dna: kittyDna, price: undefined });
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
