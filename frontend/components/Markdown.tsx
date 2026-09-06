/** Tiny server-safe Markdown renderer for authored content (§6.4).
 *
 * Only a strict subset is supported: headings, bold/italic, unordered
 * lists, links, paragraphs. It outputs React elements — no raw HTML, no
 * dangerouslySetInnerHTML — so authored content can never inject markup
 * (the §15.1 XSS tripwire). */
import { ReactNode } from "react";

const INLINE_RE =
  /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|__([^_]+)__|_([^_]+)_/g;

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (match[1]) {
      nodes.push(
        <a
          key={`a${key++}`}
          href={match[2]}
          className="text-brand-400 underline decoration-brand-400/40 underline-offset-2 hover:text-brand-500"
          rel="noopener noreferrer ugc"
        >
          {match[1]}
        </a>,
      );
    } else if (match[3] || match[5]) {
      nodes.push(<strong key={`s${key++}`}>{match[3] || match[5]}</strong>);
    } else {
      nodes.push(<em key={`e${key++}`}>{match[4] || match[6]}</em>);
    }
    last = INLINE_RE.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ source }: { source: string }) {
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`ul${key++}`} className="my-3 list-disc space-y-1 pl-5 text-zinc-300">
        {listItems.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  for (const rawLine of source.split("\n")) {
    const line = rawLine.trimEnd();
    if (line.trim() === "") {
      flushList();
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      blocks.push(
        <h3 key={`h3${key++}`} className="mt-6 text-lg font-semibold text-white">
          {renderInline(line.slice(4))}
        </h3>,
      );
    } else if (line.startsWith("## ")) {
      flushList();
      blocks.push(
        <h2 key={`h2${key++}`} className="mt-8 text-xl font-semibold text-white">
          {renderInline(line.slice(3))}
        </h2>,
      );
    } else if (line.startsWith("# ")) {
      flushList();
      blocks.push(
        <h1 key={`h1${key++}`} className="mt-8 text-2xl font-bold text-white">
          {renderInline(line.slice(2))}
        </h1>,
      );
    } else if (/^[-*] /.test(line)) {
      listItems.push(line.slice(2));
    } else {
      flushList();
      blocks.push(
        <p key={`p${key++}`} className="my-3 leading-relaxed text-zinc-300">
          {renderInline(line)}
        </p>,
      );
    }
  }
  flushList();
  return <div>{blocks}</div>;
}
