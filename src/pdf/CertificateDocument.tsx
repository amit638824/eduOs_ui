import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

export interface CertificatePdfData {
  organizationName: string;
  studentName: string;
  testTitle: string;
  certificateNo: string;
  verificationCode: string;
  verifyUrl?: string;
  percentage: number;
  totalScore: number | string;
  maxScore: number | string;
  issuedAt: string;
  enrollmentNo?: string | null;
  brandName?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    backgroundColor: '#f8fafc',
    fontFamily: 'Helvetica',
  },
  frame: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#1e3a5f',
    padding: 28,
    backgroundColor: '#ffffff',
  },
  inner: {
    flex: 1,
    borderWidth: 0.8,
    borderColor: '#94a3b8',
    padding: 24,
    justifyContent: 'space-between',
  },
  org: {
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 1.5,
    color: '#1e3a5f',
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 11,
    color: '#64748b',
    marginTop: 8,
  },
  heading: {
    textAlign: 'center',
    fontSize: 28,
    color: '#0f172a',
    fontFamily: 'Helvetica-Bold',
    marginTop: 18,
    letterSpacing: 2,
  },
  body: {
    textAlign: 'center',
    fontSize: 12,
    color: '#334155',
    marginTop: 28,
  },
  name: {
    textAlign: 'center',
    fontSize: 22,
    color: '#1e3a5f',
    fontFamily: 'Helvetica-Bold',
    marginTop: 12,
  },
  exam: {
    textAlign: 'center',
    fontSize: 14,
    color: '#0f172a',
    fontFamily: 'Helvetica-Bold',
    marginTop: 14,
  },
  score: {
    textAlign: 'center',
    fontSize: 12,
    color: '#334155',
    marginTop: 16,
  },
  footer: {
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  meta: {
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.5,
    maxWidth: '58%',
  },
  brand: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: 'Helvetica-Oblique',
    textAlign: 'right',
    maxWidth: '38%',
  },
});

export function CertificateDocument({ data }: { data: CertificatePdfData }) {
  const brand = data.brandName || 'Edumatra';
  return (
    <Document title={`Certificate ${data.certificateNo}`} author={brand}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.frame}>
          <View style={styles.inner}>
            <View>
              <Text style={styles.org}>{(data.organizationName || 'Edumatra').toUpperCase()}</Text>
              <Text style={styles.subtitle}>Certificate of Achievement</Text>
              <Text style={styles.heading}>CERTIFICATE</Text>
              <Text style={styles.body}>This is to certify that</Text>
              <Text style={styles.name}>{data.studentName}</Text>
              <Text style={styles.body}>has successfully completed the examination</Text>
              <Text style={styles.exam}>{data.testTitle}</Text>
              <Text style={styles.score}>
                Score: {data.totalScore}/{data.maxScore} · Percentage: {Number(data.percentage).toFixed(1)}%
              </Text>
              {data.enrollmentNo ? (
                <Text style={styles.score}>Enrollment No: {data.enrollmentNo}</Text>
              ) : null}
            </View>
            <View style={styles.footer}>
              <View style={styles.meta}>
                <Text>Certificate No: {data.certificateNo}</Text>
                <Text>Verification Code: {data.verificationCode}</Text>
                <Text>Issued: {data.issuedAt}</Text>
                {data.verifyUrl ? <Text>Verify: {data.verifyUrl}</Text> : null}
              </View>
              <Text style={styles.brand}>{brand}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
