import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

export interface CertificateBranding {
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  sealText?: string;
  templateId?: 'classic' | 'modern' | 'minimal';
}

export interface CertificatePdfData {
  organizationName: string;
  studentName: string;
  testTitle: string;
  certificateNo: string;
  verificationCode: string;
  verifyUrl?: string;
  qrDataUrl?: string;
  percentage: number;
  totalScore: number | string;
  maxScore: number | string;
  issuedAt: string;
  enrollmentNo?: string | null;
  brandName?: string;
  branding?: CertificateBranding;
}

/* =========================================================
   TECHWAGGER COLORS
   ========================================================= */

const NAVY = '#102A43';
const NAVY_DARK = '#0B1F33';
const GOLD = '#C9A227';
const GOLD_LIGHT = '#E8D48B';
const TEXT = '#25364A';
const MUTED = '#667085';
const WHITE = '#FFFFFF';
const LIGHT_BG = '#F8F7F2';

/* =========================================================
   STYLES
   ========================================================= */

const styles = StyleSheet.create({
  page: {
    backgroundColor: LIGHT_BG,
    fontFamily: 'Helvetica',
    position: 'relative',
  },

  certificate: {
    flex: 1,
    margin: 18,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: NAVY,
    position: 'relative',
    overflow: 'hidden',
  },

  /* =====================================================
     DECORATIVE CORNERS
  ===================================================== */

  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 90,
    height: 90,
    borderTopWidth: 13,
    borderLeftWidth: 13,
    borderColor: NAVY,
  },

  cornerTopLeftGold: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 55,
    height: 55,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderColor: GOLD,
  },

  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 90,
    height: 90,
    borderTopWidth: 13,
    borderRightWidth: 13,
    borderColor: NAVY,
  },

  cornerTopRightGold: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 55,
    height: 55,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderColor: GOLD,
  },

  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 90,
    height: 90,
    borderBottomWidth: 13,
    borderLeftWidth: 13,
    borderColor: NAVY,
  },

  cornerBottomLeftGold: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 55,
    height: 55,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderColor: GOLD,
  },

  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 90,
    height: 90,
    borderBottomWidth: 13,
    borderRightWidth: 13,
    borderColor: NAVY,
  },

  cornerBottomRightGold: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 55,
    height: 55,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: GOLD,
  },

  /* =====================================================
     INNER CONTENT
  ===================================================== */

  inner: {
    flex: 1,
    paddingTop: 30,
    paddingBottom: 22,
    paddingHorizontal: 52,
    justifyContent: 'space-between',
  },

  /* =====================================================
     HEADER
  ===================================================== */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: GOLD,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  logoText: {
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },

  brandName: {
    fontSize: 15,
    color: NAVY,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.6,
  },

  brandTagline: {
    marginTop: 3,
    fontSize: 6.5,
    color: MUTED,
    letterSpacing: 0.9,
  },

  headerMessage: {
    alignItems: 'flex-end',
    paddingTop: 2,
  },

  headerMessageLine: {
    fontSize: 6.8,
    color: NAVY,
    letterSpacing: 1,
    lineHeight: 1.45,
    textAlign: 'right',
  },

  headerMessageHighlight: {
    fontFamily: 'Helvetica-Bold',
    color: GOLD,
  },

  /* =====================================================
     TITLE
  ===================================================== */

  titleSection: {
    alignItems: 'center',
    marginTop: 14,
  },

  certificateTitle: {
    color: NAVY_DARK,
    fontFamily: 'Times-Bold',
    fontSize: 29,
    letterSpacing: 2.8,
    textAlign: 'center',
  },

  titleSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },

  titleLine: {
    width: 72,
    height: 1,
    backgroundColor: GOLD,
  },

  titleSubtitleText: {
    marginHorizontal: 10,
    color: GOLD,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
  },

  /* =====================================================
     STUDENT
  ===================================================== */

  presentedSection: {
    alignItems: 'center',
    marginTop: 10,
  },

  presentedText: {
    color: MUTED,
    fontSize: 8,
    letterSpacing: 2.2,
    fontFamily: 'Helvetica',
  },

  studentName: {
    marginTop: 6,
    color: NAVY,
    fontFamily: 'Times-Italic',
    fontSize: 30,
    textAlign: 'center',
  },

  studentLine: {
    width: 235,
    height: 1,
    backgroundColor: GOLD_LIGHT,
    marginTop: 5,
  },

  /* =====================================================
     DESCRIPTION
  ===================================================== */

  description: {
    maxWidth: 550,
    alignSelf: 'center',
    marginTop: 9,
  },

  descriptionText: {
    color: TEXT,
    fontSize: 9.5,
    lineHeight: 1.45,
    textAlign: 'center',
  },

  descriptionStrong: {
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
  },

  descriptionParagraph: {
    marginTop: 3,
  },

  keepLearning: {
    marginTop: 5,
    color: NAVY,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textAlign: 'center',
    letterSpacing: 0.4,
  },

  /* =====================================================
     CERTIFICATE INFORMATION
  ===================================================== */

  informationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 10,
    paddingHorizontal: 18,
  },

  informationItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  informationDivider: {
    width: 1,
    backgroundColor: GOLD_LIGHT,
  },

  informationLabel: {
    color: MUTED,
    fontSize: 6.8,
    letterSpacing: 1.1,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },

  informationValue: {
    color: NAVY,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },

  certificateNumber: {
    fontSize: 8.2,
    letterSpacing: 0.4,
  },

  /* =====================================================
     BOTTOM SECTION
  ===================================================== */

  bottomSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 9,
    paddingHorizontal: 18,
  },

  /* =====================================================
     GOLD SEAL
  ===================================================== */

  sealContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sealOuter: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 3,
    borderColor: GOLD,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sealInner: {
    width: 51,
    height: 51,
    borderRadius: 25.5,
    borderWidth: 1,
    borderColor: GOLD_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sealLogo: {
    color: GOLD_LIGHT,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },

  sealText: {
    color: GOLD_LIGHT,
    fontSize: 5.2,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.6,
    marginTop: 1,
  },

  /* =====================================================
     SIGNATURE
  ===================================================== */

  signatureContainer: {
    width: 160,
    alignItems: 'center',
    marginBottom: 1,
  },

  signatureLine: {
    width: 155,
    height: 1,
    backgroundColor: '#B8C0CC',
    marginBottom: 4,
  },

  signatureName: {
    color: NAVY,
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },

  signatureRole: {
    color: MUTED,
    fontSize: 6.5,
    marginTop: 2,
    textAlign: 'center',
  },

  /* =====================================================
     QR CODE
  ===================================================== */

  qrContainer: {
    width: 78,
    alignItems: 'center',
    marginBottom: 0,
  },

  qrImage: {
    width: 58,
    height: 58,
  },

  qrText: {
    color: MUTED,
    fontSize: 5.5,
    marginTop: 2,
    textAlign: 'center',
  },

  /* =====================================================
     FOOTER
  ===================================================== */

  footer: {
    alignItems: 'center',
    marginTop: 7,
  },

  footerMottoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerLine: {
    width: 55,
    height: 1,
    backgroundColor: NAVY,
  },

  footerMotto: {
    marginHorizontal: 10,
    color: NAVY,
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.4,
  },

  verificationText: {
    color: MUTED,
    fontSize: 5.5,
    textAlign: 'center',
    marginTop: 4,
  },
});

/* =========================================================
   CERTIFICATE DOCUMENT
   ========================================================= */

export function CertificateDocument({
  data,
}: {
  data: CertificatePdfData;
}) {
  const organizationName =
    data.organizationName || 'TechWagger';

  const brand =
    data.brandName || organizationName || 'TechWagger';

  const primary = data.branding?.primaryColor || NAVY;
  const accent = data.branding?.accentColor || GOLD;
  const sealText = data.branding?.sealText || 'AUTHENTIC';
  const templateId = data.branding?.templateId || 'classic';
  const logoUrl = data.branding?.logoUrl;

  const score =
    Number.isFinite(Number(data.percentage))
      ? Number(data.percentage).toFixed(1)
      : '0.0';

  const scoreLine =
    `${data.totalScore}/${data.maxScore} (${score}%)`;

  const borderColor = templateId === 'minimal' ? accent : primary;

  return (
    <Document
      title={`Certificate ${data.certificateNo}`}
      author={organizationName}
      subject="Certificate of Appreciation"
    >
      <Page
        size="A4"
        orientation="landscape"
        style={styles.page}
      >
        <View style={[styles.certificate, { borderColor }]}>

          {/* =====================================================
              DECORATIVE CORNERS
          ===================================================== */}

          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopLeftGold} />

          <View style={styles.cornerTopRight} />
          <View style={styles.cornerTopRightGold} />

          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomLeftGold} />

          <View style={styles.cornerBottomRight} />
          <View style={styles.cornerBottomRightGold} />

          {/* =====================================================
              MAIN CONTENT
          ===================================================== */}

          <View style={styles.inner}>

            {/* =================================================
                HEADER
            ================================================= */}

            <View style={styles.header}>

              {/* TECHWAGGER BRAND */}
              <View style={styles.brand}>

                <View style={styles.logoBox}>
                  <Text style={styles.logoText}>
                    Tw
                  </Text>
                </View>

                <View>
                  <Text style={styles.brandName}>
                    {brand.toUpperCase()}
                  </Text>

                  <Text style={styles.brandTagline}>
                    IDEAS | SOLUTIONS | IMPACT
                  </Text>
                </View>

              </View>

              {/* HEADER MESSAGE */}
              <View style={styles.headerMessage}>

                <Text style={styles.headerMessageLine}>
                  PEOPLE
                </Text>

                <Text style={styles.headerMessageLine}>
                  IDEAS
                </Text>

                <Text style={styles.headerMessageLine}>
                  TECHNOLOGY
                </Text>

                <Text
                  style={[
                    styles.headerMessageLine,
                    styles.headerMessageHighlight,
                  ]}
                >
                  A BRIGHTER TOMORROW
                </Text>

              </View>

            </View>

            {/* =================================================
                TITLE
            ================================================= */}

            <View style={styles.titleSection}>

              <Text style={styles.certificateTitle}>
                CERTIFICATE
              </Text>

              <View style={styles.titleSubtitle}>

                <View style={styles.titleLine} />

                <Text style={styles.titleSubtitleText}>
                  OF APPRECIATION
                </Text>

                <View style={styles.titleLine} />

              </View>

            </View>

            {/* =================================================
                STUDENT
            ================================================= */}

            <View style={styles.presentedSection}>

              <Text style={styles.presentedText}>
                PROUDLY PRESENTED TO
              </Text>

              <Text style={styles.studentName}>
                {data.studentName}
              </Text>

              <View style={styles.studentLine} />

            </View>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <View style={styles.description}>

              <Text style={styles.descriptionText}>
                In sincere appreciation of your successful completion of{' '}
                <Text style={styles.descriptionStrong}>
                  {data.testTitle}
                </Text>{' '}
                and your dedication, effort, and commitment to excellence.
              </Text>

              <Text
                style={[
                  styles.descriptionText,
                  styles.descriptionParagraph,
                ]}
              >
                Your hard work and achievement have been recognized
                through this certificate of appreciation.
              </Text>

              <Text
                style={[
                  styles.descriptionText,
                  styles.descriptionParagraph,
                ]}
              >
                Thank you for your valuable contribution to{' '}
                <Text style={styles.descriptionStrong}>
                  {organizationName}
                </Text>.
              </Text>

              <Text style={styles.keepLearning}>
                Keep learning, keep creating, keep inspiring!
              </Text>

            </View>

            {/* =================================================
                CERTIFICATE INFORMATION
            ================================================= */}

            <View style={styles.informationRow}>

              {/* ISSUE DATE */}
              <View style={styles.informationItem}>

                <Text style={styles.informationLabel}>
                  CERTIFICATE ISSUE
                </Text>

                <Text style={styles.informationValue}>
                  {data.issuedAt}
                </Text>

              </View>

              <View style={styles.informationDivider} />

              {/* CERTIFICATE NUMBER */}
              <View style={styles.informationItem}>

                <Text style={styles.informationLabel}>
                  CERTIFICATE NO.
                </Text>

                <Text
                  style={[
                    styles.informationValue,
                    styles.certificateNumber,
                  ]}
                >
                  {data.certificateNo}
                </Text>

              </View>

              <View style={styles.informationDivider} />

              {/* SCORE */}
              <View style={styles.informationItem}>

                <Text style={styles.informationLabel}>
                  PERFORMANCE
                </Text>

                <Text style={styles.informationValue}>
                  {scoreLine}
                </Text>

              </View>

            </View>

            {/* =================================================
                BOTTOM
            ================================================= */}

            <View>

              <View style={styles.bottomSection}>

                {/* GOLDEN SEAL */}
                <View style={styles.sealContainer}>

                  <View style={[styles.sealOuter, { backgroundColor: primary }]}>

                    <View style={[styles.sealInner, { borderColor: accent }]}>

                      {logoUrl ? (
                        <Image src={logoUrl} style={{ width: 28, height: 28 }} />
                      ) : (
                        <Text style={styles.sealLogo}>
                          {brand.slice(0, 2).toUpperCase()}
                        </Text>
                      )}

                      <Text style={styles.sealText}>
                        {sealText}
                      </Text>

                    </View>

                  </View>

                </View>

                {/* SIGNATURE */}
                <View style={styles.signatureContainer}>

                  <View style={styles.signatureLine} />

                  <Text style={styles.signatureName}>
                    {organizationName}
                  </Text>

                  <Text style={styles.signatureRole}>
                    Certificate Authority
                  </Text>

                </View>

                {/* QR CODE */}
                {data.qrDataUrl ? (
                  <View style={styles.qrContainer}>

                    <Image
                      src={data.qrDataUrl}
                      style={styles.qrImage}
                    />

                    <Text style={styles.qrText}>
                      Scan to verify
                    </Text>

                  </View>
                ) : (
                  <View style={styles.qrContainer} />
                )}

              </View>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <View style={styles.footer}>

                <View style={styles.footerMottoRow}>

                  <View style={styles.footerLine} />

                  <Text style={styles.footerMotto}>
                    INNOVATION INTO REALITY
                  </Text>

                  <View style={styles.footerLine} />

                </View>

                <Text style={styles.verificationText}>
                  Certificate No: {data.certificateNo}
                  {'  •  '}
                  Verification Code: {data.verificationCode}
                  {data.verifyUrl
                    ? `  •  Verify: ${data.verifyUrl}`
                    : ''}
                </Text>

              </View>

            </View>

          </View>
        </View>
      </Page>
    </Document>
  );
}