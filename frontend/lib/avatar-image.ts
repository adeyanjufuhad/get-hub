/**
 * Centre-crops an image file to a square and scales it to `size`×`size`, returning a
 * WebP blob (JPEG where the browser can't encode WebP). Keeps uploads to ~10–40 KB,
 * well under the API's 512 KB limit, and strips EXIF data such as GPS location.
 */
export async function prepareAvatar(file: File, size = 256): Promise<Blob> {
  if (!/^image\/(png|jpe?g|webp|gif|heic|heif|avif)$/i.test(file.type)) {
    throw new Error("Choose a JPEG, PNG or WebP image.");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("That image is over 15 MB. Choose a smaller one.");
  }

  // createImageBitmap honours EXIF orientation, so phone photos come out upright.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => {
    throw new Error("Couldn't read that image. Try a JPEG or PNG.");
  });

  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser can't process images here.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
  bitmap.close();

  const toBlob = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

  const webp = await toBlob("image/webp", 0.86);
  if (webp && webp.type === "image/webp") return webp;
  const jpeg = await toBlob("image/jpeg", 0.88);
  if (jpeg) return jpeg;
  throw new Error("Couldn't prepare that image.");
}
