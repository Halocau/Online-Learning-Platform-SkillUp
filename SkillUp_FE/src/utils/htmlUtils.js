// src/utils/htmlUtils.js
const decodeHTMLEntities = (html) => {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  return textarea.value;
};

export const extractCleanText = (html, maxLength = 200) => {
  if (!html) return "";

  // Remove script and style tags with their content
  let cleaned = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );
  cleaned = cleaned.replace(
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    ""
  );

  cleaned = cleaned.replace(/<img[^>]*>/gi, "");

  cleaned = cleaned.replace(
    /<\/?(div|p|br|h[1-6]|li|tr|ul|ol|article|section|figure|figcaption)[^>]*>/gi,
    " "
  );

  cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, "");

  cleaned = decodeHTMLEntities(cleaned);

  // Clean up whitespace
  cleaned = cleaned
    .replace(/\s+/g, " ")
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .trim();

  // Truncate if needed
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength).trim() + "...";
  }

  return cleaned;
};

export const extractFirstImage = (html) => {
  if (!html) return null;
  const imgMatch = html.match(/<img[^>]+src=["']([^"'>]+)["']/i);
  return imgMatch ? imgMatch[1] : null;
};