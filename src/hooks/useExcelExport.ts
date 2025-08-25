import { useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface ExportOptions {
  filename?: string;
  sheetName?: string;
}

export function useExcelExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = async <T extends Record<string, any>>(
    data: T[],
    options: ExportOptions = {}
  ) => {
    if (!data.length) {
      toast.error('Aucune donnée à exporter');
      return;
    }

    setIsExporting(true);
    
    try {
      const { filename = 'export', sheetName = 'Données' } = options;
      
      // Créer un nouveau workbook
      const wb = XLSX.utils.book_new();
      
      // Convertir les données en worksheet
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Ajouter le worksheet au workbook
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      // Générer le nom de fichier avec timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const finalFilename = `${filename}_${timestamp}.xlsx`;
      
      // Télécharger le fichier
      XLSX.writeFile(wb, finalFilename);
      
      toast.success(`Fichier exporté : ${finalFilename}`);
    } catch (error) {
      console.error('Erreur lors de l\'exportation:', error);
      toast.error('Erreur lors de l\'exportation Excel');
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToExcel, isExporting };
}