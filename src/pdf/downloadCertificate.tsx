import type { Certificate } from '@/services/examination.service';
import { CertificateDocument } from '@/pdf/CertificateDocument';
import { downloadReactPdf } from '@/pdf/downloadReactPdf';
import { formatDate, formatDateTime } from '@/utils/dateFormat';
import { siteContent } from '@/data/siteContent';
import { TestReportDocument, type TestReportPdfData } from '@/pdf/TestReportDocument';

export async function downloadCertificateReactPdf(cert: Certificate) {
  await downloadReactPdf(
    <CertificateDocument
      data={{
        organizationName: cert.org_name || siteContent.brand.name,
        studentName: cert.student_name || 'Student',
        testTitle: cert.test_title || 'Examination',
        certificateNo: cert.certificate_no,
        verificationCode: cert.verification_code,
        verifyUrl: cert.verify_url,
        percentage: Number(cert.percentage ?? 0),
        totalScore: cert.total_score ?? '—',
        maxScore: cert.max_score ?? '—',
        issuedAt: formatDate(cert.issued_at),
        enrollmentNo: cert.enrollment_no,
        brandName: siteContent.brand.name,
      }}
    />,
    `certificate-${cert.certificate_no}.pdf`,
  );
}

export async function downloadTestReportReactPdf(data: Omit<TestReportPdfData, 'brandName' | 'generatedAt'> & {
  brandName?: string;
  generatedAt?: string;
  filename?: string;
}) {
  await downloadReactPdf(
    <TestReportDocument
      data={{
        ...data,
        brandName: data.brandName || siteContent.brand.name,
        generatedAt: data.generatedAt || formatDateTime(new Date()),
      }}
    />,
    data.filename || `test-report-${Date.now()}.pdf`,
  );
}
