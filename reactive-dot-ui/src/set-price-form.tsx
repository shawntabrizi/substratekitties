import * as Form from "@radix-ui/react-form";
import { Button, Flex, TextField } from "@radix-ui/themes";
import { pending } from "@reactive-dot/core";
import { useMutation } from "@reactive-dot/react";
import { Binary } from "polkadot-api";
import { useForm } from "react-hook-form";
import { cn } from "./utils";

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
    getValues,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      price: currentPrice?.toString() || "",
    },
  });

  const [setPriceState, setPrice] = useMutation((tx) =>
    tx.Kitties.set_price({
      kitty_id: Binary.fromHex(kittyDna),
      new_price: BigInt(getValues().price),
    })
  );

  const [removeState, remove] = useMutation((tx) =>
    tx.Kitties.set_price({
      kitty_id: Binary.fromHex(kittyDna),
      new_price: undefined,
    })
  );

  return (
    <Form.Root onSubmit={handleSubmit(() => setPrice())}>
      <Flex direction="column" gap="2">
        <Form.Field name="price">
          <Form.Label>Price</Form.Label>
          <Form.Control {...register("price", { required: true })} asChild>
            <TextField.Root type="number" placeholder="Set price" />
          </Form.Control>
          <Form.Message
            className={cn(errors.price ? "text-red-500" : "hidden")}
          >
            {errors.price?.message}
          </Form.Message>
        </Form.Field>
        <Button type="submit" loading={setPriceState === pending}>
          Set Price
        </Button>
        {currentPrice !== undefined && (
          <Button
            type="button"
            onClick={() => remove()}
            variant="soft"
            loading={removeState === pending}
          >
            Remove from Market
          </Button>
        )}
      </Flex>
    </Form.Root>
  );
}
