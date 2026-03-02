import hljs from "../scripts/SyntaxHighlighter";

/**
 * Extract structured metadata from code using highlight.js
 * @param {string} code - raw code string
 * @param {string} language - detected language
 * @returns {{
 *   functions: string[],
 *   classes: string[],
 *   attributes: string[],
 *   strings: string[],
 *   numbers: string[]
 * }}
 */

export function extractCodeMetadata(code, language = "javascript") {
  let highlightedHTML = "";

  try {
    highlightedHTML = hljs.highlight(code, { language }).value;
  } catch (err) {
    highlightedHTML = hljs.highlight(code, { language: "javascript" }).value;
  }

  // Create temporary container to parse HTML
  const container = document.createElement("div");
  container.innerHTML = highlightedHTML;

  // Utility helpers
  const normalize = (text) => text.trim().replace(/^["'`]|["'`]$/g, "");
  const dedupe = (arr) => [...new Set(arr)];
  const isValidIdentifier = (str) =>
    str.length > 2 && !/^[0-9]+$/.test(str);

  // Extract tokens
  const functions = dedupe(
    [...container.querySelectorAll(".hljs-title.function_")]
      .map((el) => normalize(el.textContent))
      .filter(isValidIdentifier)
  );

  const classes = dedupe(
    [...container.querySelectorAll(".hljs-title.class_")]
      .map((el) => normalize(el.textContent))
      .filter(isValidIdentifier)
  );

  const attributes = dedupe(
    [...container.querySelectorAll(".hljs-attr")]
      .map((el) => normalize(el.textContent))
      .filter(isValidIdentifier)
  );

  const strings = dedupe(
    [...container.querySelectorAll(".hljs-string")]
      .map((el) => normalize(el.textContent))
      .filter((s) => s.length > 2)
  );

  const numbers = dedupe(
    [...container.querySelectorAll(".hljs-number")]
      .map((el) => normalize(el.textContent))
      .filter((n) => n !== "0" && n !== "1")
  );

  return {
    functions,
    classes,
    attributes,
    strings,
    numbers
  };
}