import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Estilos del documento PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb', // Blue-600
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    color: '#2563eb',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937', // Gray-800
    marginBottom: 10,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb', // Gray-200
    paddingBottom: 4,
  },
  warningBox: {
    backgroundColor: '#fef2f2', // Red-50
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444', // Red-500
    padding: 10,
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#991b1b', // Red-800
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#b91c1c', // Red-700
  },
  approachBox: {
    backgroundColor: '#f0fdf4', // Emerald-50
    borderWidth: 1,
    borderColor: '#a7f3d0', // Emerald-200
    borderRadius: 4,
    padding: 15,
    marginBottom: 20,
  },
  approachTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065f46', // Emerald-800
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    color: '#374151', // Gray-700
    lineHeight: 1.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  gridItem: {
    width: '50%',
    marginBottom: 15,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280', // Gray-500
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827', // Gray-900
  },
  roadmapList: {
    marginTop: 10,
  },
  roadmapItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  roadmapNumber: {
    width: 20,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  roadmapText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
  },
  costBox: {
    backgroundColor: '#fefce8', // Yellow-50
    borderWidth: 1,
    borderColor: '#fef08a', // Yellow-200
    borderRadius: 4,
    padding: 15,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#854d0e', // Yellow-800
  },
  costValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#713f12', // Yellow-900
  },
  adviceBox: {
    marginTop: 20,
    backgroundColor: '#eef2ff', // Indigo-50
    borderWidth: 1,
    borderColor: '#c7d2fe', // Indigo-200
    borderRadius: 4,
    padding: 15,
  },
  adviceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3730a3', // Indigo-800
    marginBottom: 4,
  },
  adviceText: {
    fontSize: 12,
    color: '#4338ca', // Indigo-700
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 10,
  }
});

// Documento estructurado PDF
const PDFReport = ({ result }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Encabezado Principal */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>ASESOR DE TECNOLOGÍA BY CHOKE</Text>
      </View>

      <Text style={styles.sectionTitle}>Diagnóstico del Proyecto</Text>

      {/* Alerta de Laguna Lógica */}
      {result.logicalGapWarning && (
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>¡Laguna Lógica Detectada!</Text>
          <Text style={styles.warningText}>{result.logicalGapWarning}</Text>
        </View>
      )}

      {/* Enfoque Recomendado */}
      <View style={styles.approachBox}>
        <Text style={styles.approachTitle}>Enfoque: {result.approachTitle}</Text>
        <Text style={styles.text}>{result.approach}</Text>
      </View>

      <Text style={styles.sectionTitle}>Stack Tecnológico Sugerido</Text>
      
      {/* Grid del Stack Tecnológico */}
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Frontend / UI</Text>
          <Text style={styles.value}>{result.frontend}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Backend / Lógica</Text>
          <Text style={styles.value}>{result.backend}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Base de Datos</Text>
          <Text style={styles.value}>{result.database}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Hosting / Infraestructura</Text>
          <Text style={styles.value}>{result.hosting}</Text>
        </View>
      </View>

      {/* Hoja de Ruta */}
      {result.roadmap && result.roadmap.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Hoja de Ruta (Primeros Pasos)</Text>
          <View style={styles.roadmapList}>
            {result.roadmap.map((step, idx) => (
              <View key={idx} style={styles.roadmapItem}>
                <Text style={styles.roadmapNumber}>{idx + 1}.</Text>
                <Text style={styles.roadmapText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Costos Estimados */}
      <View style={styles.costBox}>
        <View style={{ flex: 1 }}>
          <Text style={styles.costTitle}>Costos Estimados (Mantenimiento)</Text>
          <Text style={[styles.text, { marginTop: 2 }]}>Servidores, dominios o licencias SaaS.</Text>
        </View>
        <Text style={styles.costValue}>{result.monthlyCost}</Text>
      </View>

      {/* Consejo del Profesor */}
      {result.profeAdvice && (
        <View style={styles.adviceBox}>
          <Text style={styles.adviceTitle}>Nota del Profesor</Text>
          <Text style={styles.adviceText}>{result.profeAdvice}</Text>
        </View>
      )}

      <Text style={styles.footer}>
        Generado por el Asesor de Arquitectura de Software - Diseñado para alumnos
      </Text>

    </Page>
  </Document>
);

export default PDFReport;
