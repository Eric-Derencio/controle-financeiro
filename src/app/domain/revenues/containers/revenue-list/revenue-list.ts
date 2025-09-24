import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';


import { RevenueModel } from '../../models/revenue';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { RevenueService } from '../../services/revenue-service';

@Component({
  selector: 'app-revenue-list',
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './revenue-list.html',
  styleUrl: './revenue-list.scss'
})
export class RevenueList implements OnInit {
 private revenueService = inject(RevenueService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  displayedColumns: string[] = ['descricao', 'dataRecebimento', 'valor', 'observacao', 'acoes'];
  dataSource = new MatTableDataSource<RevenueModel>();
  total = 0;

  ngOnInit() {
    this.loadRevenues();
  }

  loadRevenues() {
    this.revenueService.getAll().subscribe((revenues) => {
      this.dataSource.data = revenues;
      this.total = revenues.reduce((acc, r) => acc + r.valor, 0);
    });
  }

  addRevenue() {
    this.router.navigate(['/receita/novo']);
  }

  editRevenue(revenue: RevenueModel) {
    this.router.navigate(['/receita', revenue.id, 'editar']);
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
