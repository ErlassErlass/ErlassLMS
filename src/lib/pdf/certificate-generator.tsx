import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToStream } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  border: {
    border: '4px solid #41A67E', // Erlass Primary
    flex: 1,
    padding: 30,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoText: {
    fontSize: 20,
    color: '#05339C',
    fontWeight: 'bold',
    position: 'absolute',
    top: 40,
    left: 40,
  },
  header: {
    fontSize: 40,
    color: '#05339C', // Erlass Secondary
    marginBottom: 5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 20,
  },
  subHeader: {
    fontSize: 12,
    color: '#41A67E',
    marginBottom: 40,
    textTransform: 'uppercase',
    letterSpacing: 4,
  },
  bodyText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    fontFamily: 'Helvetica',
  },
  recipientName: {
    fontSize: 32,
    color: '#1F2937',
    marginBottom: 10,
    marginTop: 10,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  line: {
    width: 400,
    borderBottom: '1px solid #E5C95F',
    marginBottom: 20,
  },
  courseName: {
    fontSize: 24,
    color: '#41A67E', // Erlass Primary
    marginBottom: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 80,
    marginTop: 40,
  },
  signatureBlock: {
    alignItems: 'center',
  },
  signatureLine: {
    width: 150,
    borderBottom: '1px solid #333',
    marginBottom: 5,
    marginTop: 30,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#666',
  },
  serialNumber: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    fontSize: 8,
    color: '#999',
  },
});

export interface CertificateData {
  recipientName: string;
  courseName: string;
  issuedAt: Date;
  serialNumber: string;
  type: string;
}

const CertificateDocument = ({ data }: { data: CertificateData }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.border}>
        <Text style={styles.logoText}>ERLASS PLATFORM</Text>
        
        <Text style={styles.header}>CERTIFICATE</Text>
        <Text style={styles.subHeader}>OF COMPLETION</Text>
        
        <Text style={styles.bodyText}>This is to certify that</Text>
        
        <Text style={styles.recipientName}>{data.recipientName}</Text>
        <View style={styles.line} />
        
        <Text style={styles.bodyText}>
          has successfully completed the {data.type.toLowerCase() === 'course' ? 'course' : 'challenge'}
        </Text>
        
        <Text style={styles.courseName}>{data.courseName}</Text>
        
        <View style={styles.footer}>
          <View style={styles.signatureBlock}>
            <Text style={{ fontSize: 12 }}>{data.issuedAt.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Date Issued</Text>
          </View>
          
          <View style={styles.signatureBlock}>
            {/* Signature Image Placeholder */}
            <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#05339C', position: 'absolute', bottom: 15 }}>Erlass Team</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Authorized Signature</Text>
          </View>
        </View>

        <Text style={styles.serialNumber}>ID: {data.serialNumber}</Text>
      </View>
    </Page>
  </Document>
);

export async function generateCertificatePDF(data: CertificateData) {
  return await renderToStream(<CertificateDocument data={data} />);
}
