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

const NAVY = '#0B2C5F';
const NAVY_DEEP = '#071F45';
const GOLD = '#C9A227';
const GOLD_SOFT = '#E8D48B';
const MUTED = '#4A5568';
const INK = '#1A2332';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#F7F9FC',
    fontFamily: 'Helvetica',
    position: 'relative',
  },
  canvas: {
    flex: 1,
    margin: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: NAVY,
    position: 'relative',
    overflow: 'hidden',
  },
  // Decorative corner frames (navy + gold)
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 88,
    height: 88,
    borderTopWidth: 14,
    borderLeftWidth: 14,
    borderColor: NAVY,
  },
  cornerTLGold: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 52,
    height: 52,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderColor: GOLD,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 88,
    height: 88,
    borderTopWidth: 14,
    borderRightWidth: 14,
    borderColor: NAVY,
  },
  cornerTRGold: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 52,
    height: 52,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderColor: GOLD,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 88,
    height: 88,
    borderBottomWidth: 14,
    borderLeftWidth: 14,
    borderColor: NAVY,
  },
  cornerBLGold: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 52,
    height: 52,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderColor: GOLD,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 88,
    height: 88,
    borderBottomWidth: 14,
    borderRightWidth: 14,
    borderColor: NAVY,
  },
  cornerBRGold: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 52,
    height: 52,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderColor: GOLD,
  },
  inner: {
    flex: 1,
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 56,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: GOLD,
  },
  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  brandName: {
    fontSize: 13,
    color: NAVY,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.2,
  },
  brandTag: {
    fontSize: 7,
    color: MUTED,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  sideMotto: {
    fontSize: 7,
    color: NAVY,
    textAlign: 'right',
    letterSpacing: 0.6,
    lineHeight: 1.55,
    maxWidth: 110,
  },
  titleBlock: {
    marginTop: 18,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    color: NAVY_DEEP,
    fontFamily: 'Times-Bold',
    letterSpacing: 2.5,
    textAlign: 'center',
  },
  goldRule: {
    width: 160,
    height: 1.5,
    backgroundColor: GOLD,
    marginTop: 8,
    marginBottom: 14,
  },
  presented: {
    fontSize: 9,
    color: MUTED,
    letterSpacing: 2.2,
    textAlign: 'center',
    fontFamily: 'Helvetica',
  },
  name: {
    fontSize: 30,
    color: NAVY,
    fontFamily: 'Times-Italic',
    textAlign: 'center',
    marginTop: 8,
  },
  nameRule: {
    width: 200,
    height: 1,
    backgroundColor: GOLD_SOFT,
    marginTop: 6,
    marginBottom: 12,
    alignSelf: 'center',
  },
  body: {
    fontSize: 10,
    color: INK,
    textAlign: 'center',
    lineHeight: 1.55,
    maxWidth: 480,
    alignSelf: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingHorizontal: 12,
    gap: 8,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  metaLabel: {
    fontSize: 7,
    color: MUTED,
    letterSpacing: 1,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 10,
    color: NAVY,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  footCol: {
    width: '28%',
    alignItems: 'center',
  },
  footValue: {
    fontSize: 10,
    color: INK,
    marginBottom: 4,
    textAlign: 'center',
  },
  footLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#CBD5E1',
    marginBottom: 4,
  },
  footLabel: {
    fontSize: 8,
    color: MUTED,
    letterSpacing: 0.5,
  },
  seal: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: GOLD,
    backgroundColor: NAVY_DEEP,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  sealInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: GOLD_SOFT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sealText: {
    color: GOLD_SOFT,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  sealSub: {
    color: GOLD_SOFT,
    fontSize: 5,
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  bottomBar: {
    marginTop: 10,
    alignItems: 'center',
  },
  bottomMottoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bottomLine: {
    width: 48,
    height: 1,
    backgroundColor: NAVY,
  },
  bottomMotto: {
    fontSize: 8,
    color: NAVY,
    letterSpacing: 1.5,
    fontFamily: 'Helvetica-Bold',
  },
  verifyLine: {
    fontSize: 7,
    color: MUTED,
    textAlign: 'center',
    marginTop: 6,
  },
});

export function CertificateDocument({ data }: { data: CertificatePdfData }) {
  const brand = data.brandName || 'Edumatra';
  const org = data.organizationName || brand;
  const scoreLine = `${data.totalScore}/${data.maxScore} (${Number(data.percentage).toFixed(1)}%)`;

  return (
    <Document title={`Certificate ${data.certificateNo}`} author={brand}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.canvas}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTLGold} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerTRGold} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBLGold} />
          <View style={styles.cornerBR} />
          <View style={styles.cornerBRGold} />

          <View style={styles.inner}>
            <View>
              <View style={styles.headerRow}>
                <View style={styles.brandBlock}>
                  <View style={styles.brandMark}>
                    <Text style={styles.brandMarkText}>EM</Text>
                  </View>
                  <View>
                    <Text style={styles.brandName}>{brand.toUpperCase()}</Text>
                    <Text style={styles.brandTag}>LEARN · ASSESS · CERTIFY</Text>
                  </View>
                </View>
                <Text style={styles.sideMotto}>
                  SKILL{'\n'}ASSESSMENT{'\n'}EXCELLENCE{'\n'}A BRIGHTER FUTURE
                </Text>
              </View>

              <View style={styles.titleBlock}>
                <Text style={styles.title}>CERTIFICATE OF ACHIEVEMENT</Text>
                <View style={styles.goldRule} />
                <Text style={styles.presented}>PROUDLY PRESENTED TO</Text>
                <Text style={styles.name}>{data.studentName}</Text>
                <View style={styles.nameRule} />
                <Text style={styles.body}>
                  In recognition of successfully completing the examination{' '}
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>{data.testTitle}</Text>
                  {' '}under {org}. Your dedication, performance, and commitment to excellence
                  are hereby acknowledged. Keep learning, keep achieving!
                </Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Examination</Text>
                  <Text style={styles.metaValue}>{data.testTitle}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Score</Text>
                  <Text style={styles.metaValue}>{scoreLine}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Enrollment</Text>
                  <Text style={styles.metaValue}>{data.enrollmentNo || '—'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Organization</Text>
                  <Text style={styles.metaValue}>{org}</Text>
                </View>
              </View>
            </View>

            <View>
              <View style={styles.footerRow}>
                <View style={styles.footCol}>
                  <Text style={styles.footValue}>{data.issuedAt}</Text>
                  <View style={styles.footLine} />
                  <Text style={styles.footLabel}>Date</Text>
                </View>

                <View style={styles.seal}>
                  <View style={styles.sealInner}>
                    <Text style={styles.sealText}>EM</Text>
                    <Text style={styles.sealSub}>AUTHENTIC</Text>
                  </View>
                </View>

                <View style={styles.footCol}>
                  <Text style={styles.footValue}>{brand}</Text>
                  <View style={styles.footLine} />
                  <Text style={styles.footLabel}>Authorized · {org}</Text>
                </View>
              </View>

              <View style={styles.bottomBar}>
                <View style={styles.bottomMottoWrap}>
                  <View style={styles.bottomLine} />
                  <Text style={styles.bottomMotto}>EDUCATION INTO OPPORTUNITY</Text>
                  <View style={styles.bottomLine} />
                </View>
                <Text style={styles.verifyLine}>
                  No: {data.certificateNo} · Code: {data.verificationCode}
                  {data.verifyUrl ? ` · Verify: ${data.verifyUrl}` : ''}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
