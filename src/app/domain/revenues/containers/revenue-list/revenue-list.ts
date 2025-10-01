import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';


import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { DataTable } from "../../../../shared/components/data-table/data-table";
import { TableColumn } from '../../../../shared/models/tableColumn';
import { RevenueModel } from '../../models/revenue';
import { RevenueService } from '../../services/revenue-service';

@Component({
  selector: 'app-revenue-list',
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, DataTable],
  templateUrl: './revenue-list.html',
  styleUrl: './revenue-list.scss'
})
export class RevenueList implements OnInit {
 private revenueService = inject(RevenueService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  revenues: RevenueModel[] = [];
  total = 0;
  tableColumns: TableColumn<RevenueModel>[] = [
    { key: 'descricao', header: 'Descrição' },
    { key: 'dataRecebimento', header: 'Recebimento', isDate: true },
    { key: 'valor', header: 'Valor', isCurrency: true }
  ];

  ngOnInit() {
    this.loadRevenues();
  }

  loadRevenues() {
    this.revenueService.getAll().subscribe((revenues) => {
      this.revenues = revenues;
      this.total = revenues.reduce((acc, r) => acc + (r.valor ?? 0), 0);
      this.cdr.detectChanges();
    });
  }

  addRevenue() {
    this.router.navigate(['/receitas/novo']);
  }

  editRevenue(revenue: RevenueModel) {
    this.router.navigate(['/receitas', revenue.id, 'editar']);
  }

  deleteRevenue(revenue: RevenueModel) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '350px',
      data: {
        title: 'Confirmar Exclusão',
        message: `Deseja realmente excluir a receita "${revenue.descricao}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.revenueService.delete(revenue.id!).subscribe(() => {
          this.loadRevenues();
        });
      }
    });
  }
}
