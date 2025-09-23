import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BillService } from '../../services/bill-service';
import { BillModel } from '../../models/Bill';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-bill-form',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,],
  templateUrl: './bill-form.html',
  styleUrl: './bill-form.scss'
})
export class BillForm implements OnInit {
  private fb = inject(FormBuilder);
  private billService = inject(BillService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;

  form = this.fb.group({
    descricao: ['', Validators.required],
    dataVencimento: ['', Validators.required],
    valorVariavel: [false],
    valor: [''], // inicia sem validator fixo
  });

  ngOnInit(): void {
    this.form.get('valorVariavel')?.valueChanges.subscribe((isVariavel: boolean | null) => {
      const valorControl = this.form.get('valor');
      if (!isVariavel) {
        valorControl?.addValidators(Validators.required);
      } else {
        valorControl?.clearValidators();
      }
      valorControl?.updateValueAndValidity();
    });

    this.route.paramMap.subscribe((params) => {
      const paramId = params.get('id');
      this.id = paramId ? +paramId : null;

      if (this.id) {
        this.billService.getById(this.id).subscribe((bill) => {
          this.form.patchValue({
            descricao: bill.descricao,
            dataVencimento: bill.dataVencimento,
            valorVariavel: bill.valorVariavel,
            valor: bill.valor !== undefined && bill.valor !== null ? bill.valor.toString() : '',
          });
        });
      } else {
        this.form.reset({
          descricao: '',
          dataVencimento: '',
          valorVariavel: false,
          valor: '',
        });
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const bill: BillModel = this.form.value as BillModel;

      if (this.id) {
        this.billService.update(this.id, bill).subscribe({
          next: (updatedBill) => {
            console.log('Conta atualizada com sucesso:', updatedBill);
          },
          error: (err) => console.error('Erro ao atualizar', err),
        });
      } else {
        this.billService.create(bill).subscribe({
          next: (newBill) => {
            console.log('Conta criada com sucesso:', newBill);
            this.form.reset();
          },
          error: (err) => console.error('Erro ao salvar', err),
        });
      }
    }
  }

  cancel() {
    this.router.navigate(['/contas']);
  }
}
