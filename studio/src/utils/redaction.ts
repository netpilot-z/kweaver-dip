const REDACTED_SECRET_VALUE = "***";
const SENSITIVE_KEY_PATTERN =
  /(\b[A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|PASSWD|API_KEY|COOKIE|PRIVATE_KEY|ACCESS_KEY|KWEAVER|OPENCLAW)[A-Z0-9_]*\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;}\]]+)/gi;
const SENSITIVE_ENV_KEY_PATTERN =
  /(?:TOKEN|SECRET|PASSWORD|PASSWD|API_KEY|COOKIE|PRIVATE_KEY|ACCESS_KEY|KWEAVER|OPENCLAW)/i;
const SENSITIVE_OBJECT_KEY_PATTERN =
  /(?:token|secret|password|passwd|api[_-]?key|cookie|private[_-]?key|access[_-]?key|kweaver|openclaw)/i;

/**
 * Redacts sensitive strings from a value while preserving the value shape.
 *
 * @param value The raw value that may contain sensitive content.
 * @returns The value with sensitive strings replaced by a redaction marker.
 */
export function redactSensitiveValue<T>(value: T): T {
  if (typeof value === "string") {
    return redactSensitiveText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => redactSensitiveValue(entry)) as T;
  }

  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value).map(([key, entry]) => [
      key,
      SENSITIVE_OBJECT_KEY_PATTERN.test(key)
        ? REDACTED_SECRET_VALUE
        : redactSensitiveValue(entry)
    ]);

    return Object.fromEntries(entries) as T;
  }

  return value;
}

/**
 * Redacts sensitive environment and credential assignments from one text value.
 *
 * @param text The text that may contain sensitive content.
 * @returns The text with sensitive substrings replaced by a redaction marker.
 */
export function redactSensitiveText(text: string): string {
  return redactKnownEnvironmentValues(
    text.replace(SENSITIVE_KEY_PATTERN, (_match, prefix: string) => {
      return `${prefix}${REDACTED_SECRET_VALUE}`;
    })
  );
}

/**
 * Replaces known sensitive environment values with a redaction marker.
 *
 * @param text The text that may contain raw environment values.
 * @returns The text with known sensitive environment values redacted.
 */
function redactKnownEnvironmentValues(text: string): string {
  return Object.entries(process.env).reduce((nextText, [key, value]) => {
    if (
      value === undefined ||
      value.length < 4 ||
      !SENSITIVE_ENV_KEY_PATTERN.test(key)
    ) {
      return nextText;
    }

    return nextText.replaceAll(value, REDACTED_SECRET_VALUE);
  }, text);
}
