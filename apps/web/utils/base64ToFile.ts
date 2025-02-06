export function base64ToFile(
  base64: string,
  filename: string,
  mimeType: string | undefined
): File {
  const parts = base64.split(",");
  const base64Data = parts[1];

  if (!base64Data) {
    throw new Error("Invalid base64 string format");
  }

  const byteCharacters = atob(base64Data); // Use base64Data here
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
    const slice = byteCharacters.slice(offset, offset + 1024);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    byteArrays.push(new Uint8Array(byteNumbers));
  }

  const blob = new Blob(byteArrays, { type: mimeType });
  return new File([blob], filename, { type: mimeType });
}
