// src/lib/parseIntuition.tsx
import React, { ReactElement } from "react";

/** Simple inline markdown renderer for **bold**, *italics*, and `code`. */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let idx = 0;
  const codeRegex = /`([^`]+)`/g;
  let codeMatch: RegExpExecArray | null;
  let lastIndex = 0;

  while ((codeMatch = codeRegex.exec(text)) !== null) {
    const before = text.slice(lastIndex, codeMatch.index);
    if (before) parts.push(applyBoldItalics(before));
    parts.push(
      <code
        key={`code-${idx++}`}
        className="px-1 py-0.5 rounded bg-muted text-foreground text-xs"
      >
        {codeMatch[1]}
      </code>
    );
    lastIndex = codeMatch.index + codeMatch[0].length;
  }

  const tail = text.slice(lastIndex);
  if (tail) parts.push(applyBoldItalics(tail));
  return <>{parts}</>;
}

function applyBoldItalics(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  let i = 0;
  const boldRegex = /\*\*([^*]+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = boldRegex.exec(text)) !== null) {
    const pre = text.slice(last, m.index);
    if (pre) nodes.push(applyItalics(pre));
    nodes.push(
      <strong key={`b-${i++}`} className="font-semibold">
        {applyItalics(m[1])}
      </strong>
    );
    last = m.index + m[0].length;
  }

  const rest = text.slice(last);
  if (rest) nodes.push(applyItalics(rest));
  return <>{nodes}</>;
}

function applyItalics(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  let i = 0;
  const italRegex = /(^|[\s(])\*([^*\n]+)\*(?=$|[\s).,;!?])/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = italRegex.exec(text)) !== null) {
    const pre = text.slice(last, m.index) + (m[1] || "");
    if (pre) nodes.push(pre);
    nodes.push(
      <em key={`i-${i++}`} className="italic">
        {m[2]}
      </em>
    );
    last = m.index + m[0].length;
  }

  const rest = text.slice(last);
  if (rest) nodes.push(rest);
  return <>{nodes}</>;
}

interface ListState {
  items: string[];
  implicit: boolean;
}

export function parseIntuitionText(text: string): ReactElement[] {
  if (!text) return [];

  const lines = text.split("\n");
  const elements: ReactElement[] = [];
  let key = 0;
  let paraBuf: string[] = [];

  const list: ListState = { items: [], implicit: false };
  let hasList = false;
  let afterHeading = false;

  const flushParagraph = () => {
    if (paraBuf.length === 0) return;
    const content = paraBuf.join(" ").trim();
    if (content) {
      elements.push(
        <p
          key={key++}
          className="text-sm text-foreground mb-1 leading-snug"
        >
          {renderInline(content)}
        </p>
      );
    }
    paraBuf = [];
  };

  const flushList = () => {
    if (hasList && list.items.length > 0) {
      const items = [...list.items];
      elements.push(
        <ul key={key++} className="list-disc ml-5 mb-1 space-y-0.5">
          {items.map((it, idx) => (
            <li key={`${key}-${idx}`} className="text-sm text-foreground">
              {renderInline(it)}
            </li>
          ))}
        </ul>
      );
    }
    list.items = [];
    list.implicit = false;
    hasList = false;
  };

  const flushBlocks = () => {
    flushParagraph();
    flushList();
  };

  const ensureList = (implicit: boolean) => {
    if (!hasList) {
      hasList = true;
      list.items = [];
      list.implicit = implicit;
    } else if (list.items.length === 0) {
      list.implicit = implicit;
    }
  };

  const reAtxHeading = /^(#{1,6})\s+(.+?)\s*$/;
  const reNumberedBoldHeading = /^\s*\d+[.)]\s+\*\*(.+?)\*\*:?[\s]*(.*)$/;
  const reLegacyBoldNumbered = /^\*\*\d+\)\s+(.+?):\*\*$/;
  const reBullet = /^\s*[-*•]\s+(.+)$/;

  const isBareHeading = (s: string): boolean => {
    if (!s) return false;
    if (reAtxHeading.test(s)) return false;
    if (reNumberedBoldHeading.test(s)) return false;
    if (reLegacyBoldNumbered.test(s)) return false;
    if (reBullet.test(s)) return false;
    if (/[.!?]\s*$/.test(s)) return false;
    if (s.length > 80) return false;
    if (!/^[A-Za-z0-9()[\]’'`&,+\- ]+$/.test(s)) return false;
    const words = s.trim().split(/\s+/);
    if (words.length === 1 && words[0].length < 4) return false;
    return true;
  };

  const isAnyHeadingLine = (s: string): boolean =>
    reAtxHeading.test(s) ||
    reNumberedBoldHeading.test(s) ||
    reLegacyBoldNumbered.test(s) ||
    isBareHeading(s);

  const reBoldLabelLine = /^\s*\*\*[^*]+?\*\*:/;
  const isListishFirstLine = (s: string): boolean =>
    reBullet.test(s) || reBoldLabelLine.test(s);

  const pushHeading = (level: number, title: string) => {
    const sizeClass =
      level === 1
        ? "text-lg"
        : level === 2
        ? "text-base"
        : "text-sm";
    elements.push(
      React.createElement(
        `h${Math.min(level, 6)}`,
        {
          key: key++,
          className: `${sizeClass} font-semibold text-foreground mt-2 mb-1`
        },
        renderInline(title)
      )
    );
    afterHeading = true;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      flushBlocks();
      afterHeading = false;
      continue;
    }

    {
      const m = line.match(reAtxHeading);
      if (m) {
        flushBlocks();
        const level = Math.min(m[1].length, 6);
        const title = m[2];
        pushHeading(level, title);
        continue;
      }
    }

    {
      const m = line.match(reNumberedBoldHeading);
      if (m) {
        flushBlocks();
        const title = m[1].trim().replace(/:\s*$/, "");
        const rest = (m[2] || "").trim();
        pushHeading(3, title);
        if (rest) {
          paraBuf.push(rest);
          flushParagraph();
          afterHeading = false;
        }
        continue;
      }
    }

    {
      const m = line.match(reLegacyBoldNumbered);
      if (m) {
        flushBlocks();
        const title = m[1].trim();
        pushHeading(3, title);
        continue;
      }
    }

    if (isBareHeading(line)) {
      flushBlocks();
      pushHeading(2, line);
      continue;
    }

    {
      const m = line.match(reBullet);
      if (m) {
        flushParagraph();
        ensureList(false);
        list.items.push(m[1].trim());
        afterHeading = false;
        continue;
      }
    }

    if (afterHeading) {
      if (isListishFirstLine(line)) {
        ensureList(true);
        list.items.push(line);
      } else {
        paraBuf.push(line);
      }
      afterHeading = false;
      continue;
    }

    if (hasList && list.implicit) {
      if (isAnyHeadingLine(line)) {
        flushBlocks();
        i--;
        continue;
      }
      list.items.push(line);
      continue;
    }

    if (hasList && !list.implicit) {
      if (list.items.length > 0) {
        list.items[list.items.length - 1] =
          `${list.items[list.items.length - 1]} ${line}`.trim();
        continue;
      }
    }

    paraBuf.push(line);
  }

  flushBlocks();
  return elements;
}
