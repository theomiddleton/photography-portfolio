type HashInput = Buffer | ArrayBuffer | Uint8Array

export async function generateFileHash(input: HashInput): Promise<string> {
  const crypto = await import('crypto')
  const buffer =
    input instanceof Uint8Array
      ? Buffer.from(input)
      : input instanceof ArrayBuffer
        ? Buffer.from(new Uint8Array(input))
        : input

  return crypto
    .createHash('sha256')
    .update(buffer)
    .digest('hex')
    .substring(0, 16)
}
