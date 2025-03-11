import type { AIMessage } from "../index.js";

export const encodeObjectToBinary = <T extends Record<string, unknown>[]>(
  obj: T
): Uint8Array<ArrayBufferLike> => {
  let encodeText = new TextEncoder();

  let encodedStr = encodeText.encode(JSON.stringify(obj));

  return encodedStr;
};

export const decodeBinaryToObject = (
  buffer: Uint8Array<ArrayBufferLike>
): AIMessage[] => {
  let decodeText = new TextDecoder();

  let decodedText = decodeText.decode(buffer);

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
