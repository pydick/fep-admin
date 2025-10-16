export const camelToSnake = (obj: Record<string, any>) => {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    result[newKey] = value;
  }

  return result;
};
