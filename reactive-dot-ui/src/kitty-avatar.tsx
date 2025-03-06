import { Box } from "@radix-ui/themes";

const IMAGES = {
  accessories: [
    "/avatars/accessorie_1.png",
    "/avatars/accessorie_2.png",
    "/avatars/accessorie_3.png",
    "/avatars/accessorie_4.png",
    "/avatars/accessorie_5.png",
    "/avatars/accessorie_6.png",
    "/avatars/accessorie_7.png",
    "/avatars/accessorie_8.png",
    "/avatars/accessorie_9.png",
    "/avatars/accessorie_10.png",
    "/avatars/accessorie_11.png",
    "/avatars/accessorie_12.png",
    "/avatars/accessorie_13.png",
    "/avatars/accessorie_14.png",
    "/avatars/accessorie_15.png",
    "/avatars/accessorie_16.png",
    "/avatars/accessorie_17.png",
    "/avatars/accessorie_18.png",
    "/avatars/accessorie_19.png",
    "/avatars/accessorie_20.png",
  ],
  body: [
    "/avatars/body_1.png",
    "/avatars/body_2.png",
    "/avatars/body_3.png",
    "/avatars/body_4.png",
    "/avatars/body_5.png",
    "/avatars/body_6.png",
    "/avatars/body_7.png",
    "/avatars/body_8.png",
    "/avatars/body_9.png",
    "/avatars/body_10.png",
    "/avatars/body_11.png",
    "/avatars/body_12.png",
    "/avatars/body_13.png",
    "/avatars/body_14.png",
    "/avatars/body_15.png",
  ],
  eyes: [
    "/avatars/eyes_1.png",
    "/avatars/eyes_2.png",
    "/avatars/eyes_3.png",
    "/avatars/eyes_4.png",
    "/avatars/eyes_5.png",
    "/avatars/eyes_6.png",
    "/avatars/eyes_7.png",
    "/avatars/eyes_8.png",
    "/avatars/eyes_9.png",
    "/avatars/eyes_10.png",
    "/avatars/eyes_11.png",
    "/avatars/eyes_12.png",
    "/avatars/eyes_13.png",
    "/avatars/eyes_14.png",
    "/avatars/eyes_15.png",
  ],
  mouth: [
    "/avatars/mouth_1.png",
    "/avatars/mouth_2.png",
    "/avatars/mouth_3.png",
    "/avatars/mouth_4.png",
    "/avatars/mouth_5.png",
    "/avatars/mouth_6.png",
    "/avatars/mouth_7.png",
    "/avatars/mouth_8.png",
    "/avatars/mouth_9.png",
    "/avatars/mouth_10.png",
  ],
  fur: [
    "/avatars/fur_1.png",
    "/avatars/fur_2.png",
    "/avatars/fur_3.png",
    "/avatars/fur_4.png",
    "/avatars/fur_5.png",
    "/avatars/fur_6.png",
    "/avatars/fur_7.png",
    "/avatars/fur_8.png",
    "/avatars/fur_9.png",
    "/avatars/fur_10.png",
  ],
};

function dnaToAttributes(dna: string) {
  const dnaArray = dna
    .slice(2)
    .split("")
    .map((num) => parseInt(num, 16));
  const attribute = (index: number, options: number) =>
    dnaArray[index] % options;

  return {
    body: IMAGES.body[attribute(0, 15)],
    eyes: IMAGES.eyes[attribute(1, 15)],
    accessory: IMAGES.accessories[attribute(2, 20)],
    fur: IMAGES.fur[attribute(3, 10)],
    mouth: IMAGES.mouth[attribute(4, 10)],
  };
}

export function KittyAvatar({ dna }: { dna: string }) {
  const cat = dnaToAttributes(dna);
  return (
    <Box className="h-[150px] relative w-1/2">
      <img
        alt="body"
        src={cat.body}
        className="absolute top-0 left-1/2 h-[150px]"
      />
      <img
        alt="fur"
        src={cat.fur}
        className="absolute top-0 left-1/2 h-[150px]"
      />
      <img
        alt="mouth"
        src={cat.mouth}
        className="absolute top-0 left-1/2 h-[150px]"
      />
      <img
        alt="eyes"
        src={cat.eyes}
        className="absolute top-0 left-1/2 h-[150px]"
      />
      <img
        alt="accessory"
        src={cat.accessory}
        className="absolute top-0 left-1/2 h-[150px]"
      />
    </Box>
  );
}
