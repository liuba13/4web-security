import { createHash } from "node:crypto";

// SHA-256 у шістнадцятковому вигляді.
export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
