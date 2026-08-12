/**
 * Encodes cursor data (e.g. date and document ID) into a base64url string.
 * @param {Date|string} date 
 * @param {string} id 
 * @returns {string|null}
 */
export const encodeCursor = (date, id) => {
  if (!date || !id) return null;
  const data = JSON.stringify({
    d: new Date(date).toISOString(),
    id: id.toString(),
  });
  return Buffer.from(data).toString('base64url');
};

/**
 * Decodes a cursor string into an object { d, id }.
 * @param {string} cursorStr 
 * @returns {{ d: string, id: string } | null}
 */
export const decodeCursor = (cursorStr) => {
  if (!cursorStr) return null;
  try {
    const jsonStr = Buffer.from(cursorStr, 'base64url').toString('utf8');
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.d && parsed.id) {
      return parsed;
    }
  } catch (e) {
    try {
      const jsonStr = Buffer.from(cursorStr, 'base64').toString('utf8');
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.d && parsed.id) {
        return parsed;
      }
    } catch (err) {
      return null;
    }
  }
  return null;
};
