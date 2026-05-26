/**
 * HTML sanitizer using DOMPurify for XSS protection.
 * Used to safely render coach-authored HTML content in athlete views.
 */
import createDOMPurify from "dompurify";

let DOMPurify: ReturnType<typeof createDOMPurify> | null = null;

function getDOMPurify() {
    if (!DOMPurify && typeof window !== "undefined") {
        DOMPurify = createDOMPurify(window);
    }
    return DOMPurify;
}

export function sanitizeHtml(html: string): string {
    const purify = getDOMPurify();
    if (!purify) {
        // SSR fallback: strip all tags
        return html.replace(/<[^>]*>/g, "");
    }
    return purify.sanitize(html, {
        ALLOWED_TAGS: [
            "b", "strong", "i", "em", "u", "s", "strike", "del",
            "p", "br", "hr",
            "h1", "h2", "h3", "h4", "h5", "h6",
            "ul", "ol", "li",
            "blockquote", "pre", "code",
            "a", "img",
            "table", "thead", "tbody", "tr", "th", "td",
            "div", "span", "section", "article",
        ],
        ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class", "style"],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[\w-]+[\w-./]+)$/i,
    });
}
