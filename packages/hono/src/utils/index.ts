import type { AIMessage } from "../index.js";

export const encodeObjectToBinary = <T extends Record<string, unknown>[]>(
  obj: T
): Uint8Array<ArrayBufferLike> => {
  const encodedStr = new TextEncoder().encode(JSON.stringify(obj));

  return encodedStr;
};

export const decodeBinaryToObject = (
  buffer: Uint8Array<ArrayBufferLike>
): AIMessage[] => {
  const decodedText = new TextDecoder().decode(buffer);

  if (!isValidJsonStr(decodedText)) {
    return [];
  }
  return JSON.parse(decodedText);
};

export const isValidJsonStr = (obj: string) => {
  try {
    // This will fail if the obj string is not a valid json string
    JSON.parse(obj);

    return true;
  } catch (error) {
    return false;
  }
};
