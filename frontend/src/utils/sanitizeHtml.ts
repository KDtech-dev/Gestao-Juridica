import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "a",
  "blockquote",
  "br",
  "code",
  "del",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "strong",
  "u",
  "ul",
];

export function sanitizeHtml(html: string | null | undefined): string {
  return DOMPurify.sanitize(html ?? "", {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "title"],
  });
}
