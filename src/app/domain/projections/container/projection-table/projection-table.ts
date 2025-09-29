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
import { firstValueFrom } from 'rxjs';
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

  monthsCount = 12;
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
    values: Record<number, ProjectionModel| undefined>;
    totalDebitos: number;
    saldo: number;
  }[] = [];

  ngOnInit(){
    this.init();
  }

  async init(){
    await this.ensureProjectionsAndLoad();
  }

  private generateMonths(start = new Date(), count = 12): string[] {
      const arr: string[] = [];
      const d = new Date(start.getFullYear(), start.getMonth(), 1);
      for (let i = 0; i < count; i++) {
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        arr.push(`${y}-${m.toString().padStart(2, '0')}`); // YYYY-MM
        d.setMonth(d.getMonth() + 1);
      }
      return arr;
  }

  private monthLabelFromYYYYMM(mes: string): string {
    const [y, mm] = mes.split('-');
    const date = new Date(+y, +mm - 1, 1);
    return date.toLocaleString(undefined, { month: 'short', year: 'numeric' });
  }

  private async ensureProjectionsAndLoad() {
    // 1) carregar bills e receita total
    this.bills = await firstValueFrom(this.billService.getAll());
    const revenues = await firstValueFrom(this.revenueService.getAll());
    this.receitaTotal = revenues.reduce((s, r) => s + (r.valor ?? 0), 0);

    // separar fixas x variáveis
    this.fixedBills = this.bills.filter(b => !b.valorVariavel);
    this.variableBills = this.bills.filter(b => !!b.valorVariavel);

    // 2) gerar meses
    const months = this.generateMonths(new Date(), this.monthsCount);

    // 3) buscar projeções existentes
    const existingProjs = await firstValueFrom(this.projectionService.getAll());

    // 4) criar registros faltantes (sincronizar)
    // percorre meses x bills, para cada combinação garante um registro
    for (const mes of months) {
      for (const bill of this.bills) {
        const found = existingProjs.find(p => p.mes === mes && p.contaId === bill.id);
        if (!found) {
          const valor = bill.valorVariavel ? null : (bill.valor ?? null);
          // criar registro
          // note: fazemos chamadas sequenciais simples (aceitável para small dataset)
          // se preferir, acumule observables e use forkJoin para paralelizar
          // mas sequencial garante orden e evita rate limits em dev
          await firstValueFrom(this.projectionService.create({
            mes,
            contaId: bill.id!,
            valor,
            pago: false,
            observacao: ''
          }));
        }
      }
    }

    // 5) recarregar projeções (agora já completas)
    const allProjs = await firstValueFrom(this.projectionService.getAll());

    // 6) montar pivot rows (linhas por mês)
    this.buildTableData(months, allProjs);
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
