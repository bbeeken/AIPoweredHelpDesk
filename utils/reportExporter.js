function toCSV(data) {
  if (!Array.isArray(data) || !data.length) return '';
  const headers = Object.keys(data[0]);
  const rows = [headers.join(',')];
  data.forEach(item => {
    rows.push(headers.map(h => JSON.stringify(item[h] ?? '')).join(','));
  });
  return rows.join('\n');
}

function toTextPdf(data) {
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  return `PDF REPORT\n\n${text}`;
}

function generate(data, format = 'csv') {
  switch (format) {
    case 'pdf':
      return Buffer.from(toTextPdf(data));
    case 'excel':
    case 'csv':
    default:
      return Buffer.from(toCSV(Array.isArray(data) ? data : [data]));
  }
}

function contentType(format) {
  switch (format) {
    case 'pdf':
      return 'application/pdf';
    case 'excel':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'csv':
    default:
      return 'text/csv';
  }
}

function extension(format) {
  switch (format) {
    case 'pdf':
      return 'pdf';
    case 'excel':
      return 'xlsx';
    case 'csv':
    default:
      return 'csv';
  }
}

module.exports = { generate, contentType, extension };
