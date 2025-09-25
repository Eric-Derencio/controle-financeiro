import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProjectionModel } from '../../model/Projection';

export interface ProjectionEditData {
  mes: string;
  billId: number;
  billDescricao: string;
  billValorVariavel: boolean;
  entry?: ProjectionModel | null;
}

@Component({
  selector: 'app-projection-edit-dialog',
  imports: [CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  templateUrl: './projection-edit-dialog.html',
  styleUrl: './projection-edit-dialog.scss'
})
export class ProjectionEditDialog {
  fb = new FormBuilder();
  form = this.fb.group({
    valor: [null as number | null],
    pago: [false],
    observacao: [''],
  });

  dialogRef = inject<MatDialogRef<ProjectionEditDialog, ProjectionModel | null>>(MatDialogRef);
  data: ProjectionEditData = inject(MAT_DIALOG_DATA);

  constructor() {
    const entry = this.data.entry;
    this.form.patchValue({
      valor: entry?.valor !== undefined ? entry.valor : null,
      pago: entry?.pago ?? false,
      observacao: entry?.observacao ?? '',
    });

    if (this.data.billValorVariavel && (entry?.valor === null || entry?.valor === undefined)) {
      this.form.get('valor')?.setValidators([Validators.required, Validators.min(0.01)]);
    } else {
      this.form.get('valor')?.setValidators([Validators.min(0)]);
    }
    this.form.get('valor')?.updateValueAndValidity();
  }

  cancel() {
    this.dialogRef.close(null);
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const result: ProjectionModel = {
      id: this.data.entry?.id,
      mes: this.data.mes,
      contaId: this.data.billId,
      valor: v.valor ?? null,
      pago: !!v.pago,
      observacao: v.observacao ?? '',
    };
    this.dialogRef.close(result);
  }
}
