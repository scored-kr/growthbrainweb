import type { ReactNode } from "react";

/**
 * content/privacy.md 렌더링용 최소 마크다운 변환기.
 * 지원: # / ## 제목, - 목록, | 표 |, 문단. (외부 라이브러리 없이)
 */
export function renderMarkdown(source: string, classes: Record<string, string> = {}): ReactNode[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      i++;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      out.push(
        <h2 key={key++} className={classes.h2}>
          {trimmed.slice(3)}
        </h2>,
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      out.push(
        <h1 key={key++} className={classes.h1}>
          {trimmed.slice(2)}
        </h1>,
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      out.push(
        <ul key={key++} className={classes.ul}>
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (trimmed.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i]
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim());
        if (!cells.every((c) => /^:?-{3,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      out.push(
        <div key={key++} className={classes.tableWrap}>
          <table className={classes.table}>
            {head && (
              <thead>
                <tr>
                  {head.map((cell, idx) => (
                    <th key={idx} scope="col">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // 문단: 빈 줄이나 다른 블록이 나올 때까지
    const para: string[] = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (t === "" || t.startsWith("#") || t.startsWith("- ") || t.startsWith("|")) break;
      para.push(t);
      i++;
    }
    out.push(
      <p key={key++} className={classes.p}>
        {para.join(" ")}
      </p>,
    );
  }

  return out;
}
