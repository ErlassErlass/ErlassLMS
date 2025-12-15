import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts if needed (using standard Helvetica for now)
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  border: {
    border: '5px solid #41A67E', // Erlass Primary
    height: '100%',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    fontSize: 36,
    marginBottom: 20,
    color: '#05339C', // Erlass Secondary
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  subHeader: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10
  },
  name: {
    fontSize: 48,
    color: '#41A67E', // Erlass Primary
    marginBottom: 20,
    fontStyle: 'italic',
    fontWeight: 'bold'
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: 600,
    lineHeight: 1.5
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 20
  },
  serial: {
    fontSize: 10,
    color: '#999',
    position: 'absolute',
    bottom: 20,
    right: 20
  },
  signatureSection: {
    marginTop: 40,
    borderTop: '1px solid #333',
    width: 200,
    textAlign: 'center',
    paddingTop: 10
  }
});

interface CertificateProps {
  studentName: string;
  courseName: string;
  date: string;
  serialNumber: string;
}

export const CertificateTemplate = ({ studentName, courseName, date, serialNumber }: CertificateProps) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.border}>
        <Text style={styles.header}>Sertifikat Kelulusan</Text>
        <Text style={styles.subHeader}>Diberikan kepada:</Text>
        
        <Text style={styles.name}>{studentName}</Text>
        
        <Text style={styles.description}>
          Atas keberhasilannya menyelesaikan kursus pembelajaran
          {'\n'}
          <Text style={{ fontWeight: 'bold', color: '#05339C' }}>{courseName}</Text>
          {'\n'}
          di ERLASS Platform dengan hasil yang memuaskan.
        </Text>

        <View style={styles.signatureSection}>
          <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Kepala Program</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>Erlass Platform Indonesia</Text>
        </View>

        <Text style={styles.date}>Diterbitkan pada: {date}</Text>
        <Text style={styles.serial}>Serial No: {serialNumber}</Text>
      </View>
    </Page>
  </Document>
);
