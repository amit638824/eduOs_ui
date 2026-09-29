import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

export interface TestReportPdfRow {
  rank?: number | null;
  first_name?: string;
  last_name?: string;
  email?: string;
  enrollment_no?: string | null;
  total_score?: number | string;
  max_score?: number | string;
  percentage?: number | string;
  accuracy?: number | string | null;
  certificate_no?: string | null;
}

export interface TestReportPdfData {
  brandName?: string;
  orgName?: string;
  testTitle: string;
  generatedAt: string;
  stats: {
    attempt_count?: number;
    avg_score?: number | string;
    max_score?: number | string;
    min_score?: number | string;
    pass_rate?: number;
    passed?: number;
    avg_percentage?: number | string;
  };
  results: TestReportPdfRow[];
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    paddingBottom: 48,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#0f172a',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 12,
  },
  stats: {
    marginBottom: 14,
    lineHeight: 1.5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontFamily: 'Helvetica-Bold',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
  },
  colRank: { width: '8%' },
  colName: { width: '22%' },
  colEmail: { width: '24%' },
  colScore: { width: '12%' },
  colPct: { width: '10%' },
  colAcc: { width: '10%' },
  colCert: { width: '14%' },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 8,
    color: '#64748b',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

function HeaderRow() {
  return (
    <View style={styles.tableHeader} wrap={false}>
      <Text style={styles.colRank}>Rank</Text>
      <Text style={styles.colName}>Student</Text>
      <Text style={styles.colEmail}>Email</Text>
      <Text style={styles.colScore}>Score</Text>
      <Text style={styles.colPct}>%</Text>
      <Text style={styles.colAcc}>Acc.</Text>
      <Text style={styles.colCert}>Cert.</Text>
    </View>
  );
}

function DataRow({ r, i }: { r: TestReportPdfRow; i: number }) {
  const name = `${r.first_name ?? ''} ${r.last_name ?? ''}`.trim() || '—';
  return (
    <View style={styles.row} wrap={false}>
      <Text style={styles.colRank}>{String(r.rank ?? i + 1)}</Text>
      <Text style={styles.colName}>{name}</Text>
      <Text style={styles.colEmail}>{r.email ?? '—'}</Text>
      <Text style={styles.colScore}>
        {r.total_score ?? '—'}/{r.max_score ?? '—'}
      </Text>
      <Text style={styles.colPct}>{`${Number(r.percentage ?? 0).toFixed(1)}%`}</Text>
      <Text style={styles.colAcc}>
        {r.accuracy != null ? `${Number(r.accuracy).toFixed(1)}%` : '—'}
      </Text>
      <Text style={styles.colCert}>{r.certificate_no || '—'}</Text>
    </View>
  );
}

export function TestReportDocument({ data }: { data: TestReportPdfData }) {
  const brand = data.brandName || 'Edumatra';
  const chunks: TestReportPdfRow[][] = [];
  const pageSize = 28;
  for (let i = 0; i < data.results.length; i += pageSize) {
    chunks.push(data.results.slice(i, i + pageSize));
  }
  if (chunks.length === 0) chunks.push([]);

  return (
    <Document title={`Report — ${data.testTitle}`} author={brand}>
      {chunks.map((rows, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          {pageIndex === 0 && (
            <View>
              <Text style={styles.title}>{brand}</Text>
              <Text style={styles.subtitle}>
                Test Report — {data.testTitle}
                {data.orgName ? ` · ${data.orgName}` : ''}
              </Text>
              <View style={styles.stats}>
                <Text>Attempts: {data.stats.attempt_count ?? data.results.length}</Text>
                <Text>Average score: {Number(data.stats.avg_score ?? 0).toFixed(2)}</Text>
                <Text>
                  Highest: {String(data.stats.max_score ?? 0)} · Lowest:{' '}
                  {String(data.stats.min_score ?? 0)}
                </Text>
                <Text>Pass rate: {Number(data.stats.pass_rate ?? 0).toFixed(1)}%</Text>
                <Text>Generated: {data.generatedAt}</Text>
              </View>
            </View>
          )}
          <HeaderRow />
          {rows.map((r, i) => (
            <DataRow key={`${pageIndex}-${i}`} r={r} i={pageIndex * pageSize + i} />
          ))}
          <View style={styles.footer} fixed>
            <Text>{brand} · Confidential</Text>
            <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
          </View>
        </Page>
      ))}
    </Document>
  );
}
