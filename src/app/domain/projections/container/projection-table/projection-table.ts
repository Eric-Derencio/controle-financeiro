import { ProjectionModel } from './../../model/Projection';
import { RevenueService } from './../../../revenues/services/revenue-service';
import { BillService } from './../../../bills/services/bill-service';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProjectionService } from '../../service/projection.service';
import { BillModel } from '../../../bills/models/Bill';
import { firstValueFrom, forkJoin } from 'rxjs';
import { ProjectionEditDialog } from '../../components/projection-edit-dialog/projection-edit-dialog';

@Component({
  selector: 'app-projection-table',
  imports: [CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatTooltipModule],
  templateUrl: './projection-table.html',
  styleUrl: './projection-table.scss'
})
export class ProjectionTable implements OnInit {
  private billService = inject(BillService);
  private revenueService = inject(RevenueService);
  private projectionService = inject(ProjectionService);
  private dialog = inject(MatDialog);

  private readonly MONTHS = [
    { numero: 1, nome: 'Janeiro' },
    { numero: 2, nome: 'Fevereiro' },
    { numero: 3, nome: 'Março' },
    { numero: 4, nome: 'Abril' },
    { numero: 5, nome: 'Maio' },
    { numero: 6, nome: 'Junho' },
    { numero: 7, nome: 'Julho' },
    { numero: 8, nome: 'Agosto' },
    { numero: 9, nome: 'Setembro' },
    { numero: 10, nome: 'Outubro' },
    { numero: 11, nome: 'Novembro' },
    { numero: 12, nome: 'Dezembro' }
  ];
  dataSource = new MatTableDataSource<{
    mes: string;
    mesLabel: string;
    values: Record<number, ProjectionModel | undefined>;
    totalDebitos: number;
    saldo: number;
  }>([]);

  bills: BillModel[] = [];
  fixedBills: BillModel[] = [];
  variableBills: BillModel[] = [];

  displayedColumns: string[] = [];

  receitaTotal = 0;

  rows: {
    mes: string;
    mesLabel: string;
    values: Record<number, ProjectionModel | undefined>;
    totalDebitos: number;
    saldo: number;
  }[] = [];

  async ngOnInit() {
    await this.loadInitialData();
    await this.syncProjections();
    await this.loadAndBuildTable();
  }

  private async loadInitialData() {
    this.bills = await firstValueFrom(this.billService.getAll());
    const revenues = await firstValueFrom(this.revenueService.getAll());
    this.receitaTotal = revenues.reduce((s, r) => s + (r.valor ?? 0), 0);

    this.fixedBills = this.bills.filter(b => !b.valorVariavel);
    this.variableBills = this.bills.filter(b => !!b.valorVariavel);
  }

  private async syncProjections() {
    const currentYear = new Date().getFullYear();
    const months = this.generateYearMonths(currentYear);

    const existing = await firstValueFrom(this.projectionService.getAll());
    const missing: ProjectionModel[] = [];

    for (const mes of months) {
      for (const bill of this.bills) {
        const found = existing.find(p => p.mes === mes && p.contaId === bill.id);
        if (!found) {
          missing.push({
            mes,
            contaId: bill.id!,
            valor: bill.valorVariavel ? null : (bill.valor ?? null),
            pago: false,
            observacao: ''
          });
        }
      }
    }

    if (missing.length > 0) {
      await firstValueFrom(forkJoin(missing.map(m => this.projectionService.create(m))));
    }
  }

  private async loadAndBuildTable() {
    const currentYear = new Date().getFullYear();
    const months = this.generateYearMonths(currentYear);
    const allProjs = await firstValueFrom(this.projectionService.getAll());

    this.buildTableData(months, allProjs);
  }

  private generateYearMonths(year: number): string[] {
    return this.MONTHS.map(m => `${year}-${m.numero.toString().padStart(2, '0')}`);
  }

  private monthLabelFromYYYYMM(mes: string): string {
    const [, mm] = mes.split('-');
    return this.MONTHS[+mm - 1].nome; // acessa pelo número do mês
  }


  private buildTableData(months: string[], allProjs: ProjectionModel[]) {
    // construir displayedColumns: coluna MES + cada bill (ordem: fixas primeiro, depois variáveis) + debitos + receita + saldo
    const billOrder = [...this.fixedBills, ...this.variableBills];
    this.displayedColumns = ['mes', ...billOrder.map(b => this.colId(b.id!)), 'debitos', 'receita', 'saldo'];

    // montar rows
    this.rows = months.map((mes) => {
      const values: Record<number, ProjectionModel | undefined> = {};
      for (const bill of this.bills) {
        const p = allProjs.find(x => x.mes === mes && x.contaId === bill.id);
        values[bill.id!] = p;
      }
      const totalDebitos = Object.values(values).reduce((s, p) => s + (p && p.valor ? p.valor : 0), 0);
      const receita = this.receitaTotal;
      const saldo = receita - totalDebitos;
      return {
        mes,
        mesLabel: this.monthLabelFromYYYYMM(mes),
        values,
        totalDebitos,
        saldo
      };
    });

    // dataSource
    this.dataSource.data = this.rows;
  }

  colId(billId: number) {
    return `bill_${billId}`;
  }

  formatCellValue(entry?: ProjectionModel | undefined) {
    if (!entry || entry.valor === null || entry.valor === undefined) return '';
    return (entry.valor).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  async openEdit(rowMes: string, bill: BillModel) {
    // carregar projeção atual (se existir)
    const all = await firstValueFrom(this.projectionService.getAll());
    const entry = all.find(p => p.mes === rowMes && p.contaId === bill.id) ?? null;

    const dialogRef = this.dialog.open(ProjectionEditDialog, {
      width: '420px',
      data: {
        mes: rowMes,
        billId: bill.id,
        billDescricao: bill.descricao,
        billValorVariavel: !!bill.valorVariavel,
        entry
      }
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    if (!result) return; // cancelou

    if (result.id) {
      // update
      await firstValueFrom(this.projectionService.update(result.id, result));
    } else {
      // create (shouldn't happen often because we create all on ensure, but just in case)
      await firstValueFrom(this.projectionService.create(result));
    }

    // recarregar e rebuild
    const reload = await firstValueFrom(this.projectionService.getAll());
    const months = this.rows.map(r => r.mes); // manter os mesmos meses
    this.buildTableData(months, reload);
  }

  // helper: exibir ícone pago
  isPaid(entry?: ProjectionModel) {
    return !!entry && !!entry.pago;
  }

  get allBills() {
    return [...this.fixedBills, ...this.variableBills];
  }
}
