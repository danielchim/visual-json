import type { JsonValue } from "@visual-json/core";

function extractJSON(rawJson: string): string {
  return rawJson
    .replace(/\s*while\((1|true)\)\s*;?/, "")
    .replace(/\s*for\(;;\)\s*;?/, "")
    .replace(/^[^{\[].+\(\s*?{/, "{")
    .replace(/}\s*?\);?\s*$/, "}");
}

function allTextNodes(nodes: NodeList): boolean {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].nodeName !== "#text") {
      return false;
    }
  }
  return true;
}

function getPreWithSource(): HTMLPreElement | null {
  const childNodes = document.body.childNodes;

  if (childNodes.length === 0) {
    return null;
  }

  console.debug(
    `[visual-json] getPreWithSource: Found ${childNodes.length} child nodes in body`,
  );

  if (childNodes.length > 1 && allTextNodes(childNodes)) {
    if (process.env.NODE_ENV === "development") {
      console.debug(
        "[visual-json] Loaded from multiple text nodes, normalizing",
      );
    }
    document.body.normalize(); // concatenates adjacent text nodes
    console.debug(
      `[visual-json] getPreWithSource: Normalized to ${document.body.childNodes.length} nodes`,
    );
  }

  const childNode = document.body.childNodes[0];
  const nodeName = childNode.nodeName;
  const textContent = childNode.textContent || "";

  console.debug(`[visual-json] getPreWithSource: First node is ${nodeName}`);

  if (nodeName === "PRE") {
    return childNode as HTMLPreElement;
  }

  // if Content-Type is text/html
  if (nodeName === "#text" && textContent.trim().length > 0) {
    if (process.env.NODE_ENV === "development") {
      console.debug(
        `[visual-json] Loaded from a text node (length: ${textContent.length}), this might have returned content-type: text/html`,
      );
    }

    const pre = document.createElement("pre");
    pre.textContent = textContent;
    document.body.removeChild(childNode);
    document.body.insertBefore(pre, document.body.firstChild);
    return pre;
  }

  console.debug(
    "[visual-json] getPreWithSource: First node is neither PRE nor non-empty #text",
  );
  return null;
}

function isJSON(jsonStr: string): boolean {
  let str = jsonStr;
  if (!str || str.length === 0) {
    return false;
  }

  str = str.replace(/\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@");
  str = str.replace(
    /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?/g,
    "]",
  );
  str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, "");
  return /^[\],:{}\s]*$/.test(str);
}

function isJSONP(jsonStr: string): boolean {
  return isJSON(extractJSON(jsonStr));
}

export function detectJsonPage(): JsonValue | null {
  console.log("[visual-json] Starting JSON page detection...");

  // 1. Check Content-Type if available (most reliable indicator)
  const contentType = document.contentType || "";
  console.log(`[visual-json] Document Content-Type: ${contentType}`);

  // If it's explicitly HTML, we should be extremely careful.
  // Only proceed if it looks like a browser-wrapped text/html response (e.g. only one element which is a PRE)
  const isHtml = contentType.includes("text/html");

  // 2. Check body structure.
  // Raw JSON/JSONP responses usually have VERY few elements in the body (usually 1 or 0, maybe 2 if another extension is present).
  const children = Array.from(document.body.children);
  const nonScriptElements = children.filter(
    (el) => el.tagName !== "SCRIPT" && el.tagName !== "STYLE",
  );

  console.log(
    `[visual-json] Body has ${children.length} children, ${nonScriptElements.length} are non-script/style.`,
  );

  if (nonScriptElements.length > 2) {
    console.log(
      "[visual-json] Bail out: Page has too many non-script elements. Likely a real HTML page.",
    );
    return null;
  }

  // If there ARE elements, and none of them is a PRE, it's likely not a raw JSON page
  // (unless it's just a text node, which we handle below).
  if (
    nonScriptElements.length > 0 &&
    !nonScriptElements.some((el) => el.tagName === "PRE")
  ) {
    console.log("[visual-json] Bail out: Page has elements but no PRE tag.");
    return null;
  }

  const pre = getPreWithSource();

  if (!pre) {
    console.log("[visual-json] No suitable PRE or text node found.");
    return null;
  }

  const textContent = (pre.textContent || "").trim();
  console.log(
    "[visual-json] Found potential JSON content, length:",
    textContent.length,
  );

  // 3. Quick structural checks on the text
  if (textContent.length < 2) {
    console.log("[visual-json] Bail out: Content too short.");
    return null;
  }

  if (textContent.startsWith("<")) {
    console.log(
      "[visual-json] Bail out: Content starts with '<', likely HTML.",
    );
    return null;
  }

  // 4. Regex and Parsing
  if (isJSON(textContent) || isJSONP(textContent)) {
    console.log("[visual-json] Content passed Regex JSON/JSONP check.");
    try {
      // First try parsing directly
      const parsed = JSON.parse(textContent) as JsonValue;

      // If we're in an HTML document, the parsed value MUST be an object or array to avoid false positives with simple numbers/strings
      if (isHtml && (typeof parsed !== "object" || parsed === null)) {
        console.log(
          "[visual-json] Bail out: Parsed JSON in HTML but it's not an object/array (plain primitive).",
        );
        return null;
      }

      console.log("[visual-json] Successfully parsed as direct JSON.");
      return parsed;
    } catch (e: any) {
      console.log("[visual-json] Direct JSON parse failed:", e.message);
      try {
        // If it fails, try extracting (e.g., JSONP or while(1); wrappers)
        const extracted = extractJSON(textContent);
        if (extracted === textContent)
          throw new Error("No extraction possible");

        const parsed = JSON.parse(extracted) as JsonValue;
        console.log(
          "[visual-json] Successfully parsed as extracted JSON/JSONP.",
        );
        return parsed;
      } catch (e: any) {
        console.log("[visual-json] Extracted JSON parse failed:", e.message);
        return null;
      }
    }
  } else {
    console.log("[visual-json] Content failed Regex JSON/JSONP check.");
  }

  return null;
}
