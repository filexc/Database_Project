/**
 * Split one TSV row into fields. Tabs inside double-quoted segments are preserved.
 * Supports escaped quotes ("") inside quoted fields.
 */
export function splitTsvLine(line) {
  const fields = [];
  let field = '';
  let i = 0;
  let inQuotes = false;

  while (i < line.length) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
    } else {
      if (c === '\t') {
        fields.push(field);
        field = '';
        i++;
      } else if (c === '"') {
        inQuotes = true;
        i++;
      } else {
        field += c;
        i++;
      }
    }
  }
  fields.push(field);
  return fields;
}

/**
 * Split full TSV text into row strings. Newlines inside quoted fields do not end a row.
 */
export function splitTsvRecords(text) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows = [];
  let rowStart = 0;
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i++) {
    const c = normalized[i];
    if (c === '"') {
      if (inQuotes && normalized[i + 1] === '"') {
        i++;
        continue;
      }
      inQuotes = !inQuotes;
    } else if (c === '\n' && !inQuotes) {
      rows.push(normalized.slice(rowStart, i));
      rowStart = i + 1;
    }
  }
  rows.push(normalized.slice(rowStart));

  while (rows.length > 0 && rows[rows.length - 1] === '') {
    rows.pop();
  }
  return rows;
}
