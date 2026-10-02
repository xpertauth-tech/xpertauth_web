import { Fragment } from "react";

// Texto legal con marcado mínimo: **negrita**, `código`, [texto](url), bloques separados por
// línea en blanco y viñetas con "- ". Los enlaces externos se abren en pestaña nueva.
const INLINE = /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;

function Inline({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(<strong key={m.index} className="font-semibold text-white/90">{m[1]}</strong>);
    } else if (m[2] !== undefined) {
      out.push(<code key={m.index} className="font-mono text-xs text-[#4D9FEC] bg-white/5 px-1.5 py-0.5 rounded">{m[2]}</code>);
    } else {
      const externo = /^https?:/.test(m[4]);
      out.push(
        <a
          key={m.index}
          href={m[4]}
          {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="text-[#4D9FEC] underline hover:text-[#4D9FEC]/80 transition-colors"
        >
          {m[3]}
        </a>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

function Block({ block }: { block: string }) {
  const groups: { lista: boolean; lines: string[] }[] = [];
  for (const line of block.split("\n")) {
    const esItem = line.startsWith("- ");
    const prev = groups[groups.length - 1];
    if (prev && prev.lista === esItem) prev.lines.push(esItem ? line.slice(2) : line);
    else groups.push({ lista: esItem, lines: [esItem ? line.slice(2) : line] });
  }
  return (
    <>
      {groups.map((g, i) =>
        g.lista ? (
          <ul key={i} className="list-disc pl-5 space-y-1.5 marker:text-white/30">
            {g.lines.map((l, j) => (
              <li key={j}><Inline text={l} /></li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            {g.lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <Inline text={l} />
              </Fragment>
            ))}
          </p>
        )
      )}
    </>
  );
}

export default function LegalText({ text, className = "" }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <div className={`text-white/65 text-sm leading-relaxed space-y-3 ${className}`}>
      {text.split(/\n\s*\n/).map((b, i) => (
        <Block key={i} block={b} />
      ))}
    </div>
  );
}

export { Inline };
