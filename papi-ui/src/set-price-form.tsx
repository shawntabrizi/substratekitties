import * as Form from "@radix-ui/react-form";
import { Button, Flex, TextField } from "@radix-ui/themes";
import { SubmitHandler, useForm } from "react-hook-form";
import { cn } from "./utils";

interface Props {
  kittyDna: string;
  currentPrice: number | null;
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

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    // TODO: Implement set price logic
    console.log(`Setting price for kitty ${kittyDna} to ${data.price}`);
  };

  const handleRemoveFromMarket = () => {
    // TODO: Implement remove kitty from the market
    console.log(`Removing kitty ${kittyDna} from the market`);
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
        <Button type="submit">Set Price</Button>
        {currentPrice !== null && (
          <Button type="button" onClick={handleRemoveFromMarket} variant="soft">
            Remove from Market
          </Button>
        )}
      </Flex>
    </Form.Root>
  );
}
