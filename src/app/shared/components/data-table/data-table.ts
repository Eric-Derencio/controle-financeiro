import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { TableColumn } from '../../models/tableColumn';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';



@Component({
  selector: 'app-data-table',
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss'
})
export class DataTable<T extends {id?: number| string}> implements OnChanges {
  @Input() data: T[] = [];
  @Input() columns: TableColumn<T>[] = [];
  @Input() buttonText = 'Novo Item';
  @Input() showFooter = false;
  @Input() total = 0;


  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<T>();
  @Output() delete = new EventEmitter<T>();

  dataSource = new MatTableDataSource<T>();
  displayedColumns: string[] = [];

  ngOnChanges() {
    this.dataSource.data = this.data;
    this.displayedColumns = [...this.columns.map(c => c.key), 'acoes'];
  }

  onAdd(): void {
    this.add.emit();
  }

  onEdit(item: T): void {
    this.edit.emit(item);
  }

  onDelete(item: T): void {
    this.delete.emit(item);
  }
}
