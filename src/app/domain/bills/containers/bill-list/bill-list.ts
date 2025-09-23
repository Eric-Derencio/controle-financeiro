import { CommonModule } from '@angular/common';
import { Component, inject, OnInit} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BillService } from '../../services/bill-service';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { BillModel } from '../../models/Bill';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bill-list',
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './bill-list.html',
  styleUrl: './bill-list.scss',
})
export class BillList implements OnInit {
  private billService = inject(BillService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  displayedColumns: string[] = ['descricao', 'dataVencimento', 'valor', 'acoes'];
  dataSource = new MatTableDataSource<BillModel>();


  ngOnInit() {
    this.loadBills();
  }

  addBill() {
    this.router.navigate(['/contas/novo']);
  }

  loadBills() {
    this.billService.getAll().subscribe((bills) => {
      this.dataSource.data = bills;
    });
  }

  editBill(bill: BillModel) {
    this.router.navigate(['/contas', bill.id, 'editar']);
  }

  deleteBill(bill: BillModel) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '350px',
      data: {
        title: 'Confirmar Exclusão',
        message: `Deseja realmente excluir a conta "${bill.descricao}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.billService.delete(bill.id!).subscribe(() => {
          this.loadBills();
        });
      }
    });
  }

}
