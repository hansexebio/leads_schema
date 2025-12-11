// file-upload.component.ts (Angular 20 standalone)
import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule,],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private cdr: ChangeDetectorRef) { }


  workbook: XLSX.WorkBook | null = null;
  sheetNames: string[] = [];
  selectedSheet: string | null = null;

  previewRows: any[] = [];
  columns: string[] = [];

  // * relacion

  mapping: { original: string, newName: string }[] = [];
  jsonResult = '';


  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      this.workbook = XLSX.read(data, { type: 'array' });

      this.sheetNames = this.workbook.SheetNames; // nombres de hojas

      // seleccionar primera hoja por defecto
      if (this.sheetNames.length > 0) {
        this.selectSheet(this.sheetNames[0]);
      }
    };

    reader.readAsArrayBuffer(file);
  }

  selectSheet(sheetName: string) {
    this.selectedSheet = sheetName;

    if (!this.workbook) return;

    const sheet = this.workbook.Sheets[sheetName];

    // convertir la hoja a JSON formato matriz
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    // columnas (primera fila)
    this.columns = (json[0] || []).map((c: any) => c?.toString?.() ?? '');

    // obtener 3 filas de vista previa
    this.previewRows = (json.slice(1, 4) as any[][]).map((rowArr: any[]) => {
      const obj: any = {};
      this.columns.forEach((col, i) => {
        obj[col] = rowArr?.[i] ?? '';
      });
      return obj;
    });

    // generar estructura para renombrar
    this.mapping = this.columns.map(col => ({
      original: col,
      newName: this.normalize(col)
    }));

    this.updateJsonPreview();
    this.cdr.detectChanges();
  }


  updateJsonPreview() {
    const obj: any = {};

    this.mapping.forEach(m => {
      if (m.newName.trim()) {
        obj[m.newName] = m.original;
      }
    });

   this.jsonResult = JSON.stringify(obj, null, 2);
   this.cdr.detectChanges();
  }

  normalize(str: string): string {
    return str
      ?.trim()
      ?.replace(/\s+/g, '_')
      ?.replace(/[^a-zA-Z0-9_]/g, '')  // quita comillas, tildes, símbolos raros
      ?.toLowerCase() || '';
  }


  onNameInput(event: any, m: any) {
  const raw = event.target.value;
  const normalized = this.normalize(raw);

  // Reasigna al modelo
  m.newName = normalized;

  // Actualiza visualmente el input
  event.target.value = normalized;

  this.updateJsonPreview();
}



  // Normaliza nombres de columnas
  // normalize(str: string): string {
  //   return str
  //     ?.trim()
  //     ?.replace(/\s+/g, '_')
  //     ?.replace(/[^a-zA-Z0-9_]/g, '')  // quita comillas, tildes, símbolos raros
  //     ?.toLowerCase() || '';
  // }
  // selectSheet(sheetName: string) {
  //   this.selectedSheet = sheetName;

  //   if (!this.workbook) return;

  //   const sheet = this.workbook.Sheets[sheetName];
  //   const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  //   // columnas visibles (tal cual vienen)
  //   const rawColumns = (json[0] || []).map((c: any) => c?.toString?.() ?? '');

  //   // columnas para Angular (normalizadas)
  //   this.columns = rawColumns.map(c => this.normalize(c));

  //   // Vista previa
  //   this.previewRows = json.slice(1, 4).map((rowArr: any[]) => {
  //     const obj: any = {};
  //     this.columns.forEach((col, i) => {
  //       obj[col] = rowArr?.[i] ?? '';
  //     });
  //     return obj;
  //   });

  //   console.log("COLUMNS:", this.columns);
  //   console.log("PREVIEW:", this.previewRows);
  //   this.cdr.detectChanges();
  // }

}
