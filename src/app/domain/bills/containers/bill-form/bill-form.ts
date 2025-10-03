import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import { firstValueFrom, of, Subject, switchMap, takeUntil } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-bill-form',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './bill-form.html',
  styleUrl: './bill-form.scss'
})
export class BillForm implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private billService = inject(BillService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private destroyed$ = new Subject<void>();

  id: number | null = null;

  form = this.fb.group({
    descricao: ['', Validators.required],
    dataVencimento: [''],
    valorVariavel: [false],
    valor: [''],
  });

  get isEditing(): boolean {
    return this.id !== null;
  }
  get valorVariavel(): boolean {
    return this.form.get('valorVariavel')?.value ?? false;
  }

  ngOnInit(): void {
    this.loadDataForEdit();
    this.setupDynamicValidators();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private setupDynamicValidators(): void {
    this.form.get('valorVariavel')?.valueChanges.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(isVariavel => {
      const valorControl = this.form.get('valor');
      if (!isVariavel) {
        valorControl?.setValidators(Validators.required);
      } else {
        valorControl?.clearValidators();
      }
      valorControl?.updateValueAndValidity();
    });
  }

  private loadDataForEdit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroyed$),
      switchMap(params => {
        const paramId = params.get('id');
        this.id = paramId ? +paramId : null;
        return this.id ? this.billService.getById(this.id) : of(null);
      })
    ).subscribe(bill => {
      if (bill) {
        this.form.patchValue({
          ...bill,
          valor: bill.valor?.toString()
        });
      } else {
        this.form.reset({ valorVariavel: false });
      }
    });
  }

  private buildBillFromForm(): BillModel {
    const formValue = this.form.getRawValue();
    return {
      ...formValue,
      valor: formValue.valorVariavel ? null : +formValue.valor!
    };
  }

  async onSubmit() {
    if (this.form.invalid) return;

    const bill = this.buildBillFromForm();

    try {
      if (this.isEditing) {
        await firstValueFrom(this.billService.update(this.id!, bill));
        this.snackBar.open('Conta atualizada com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      } else {
        await firstValueFrom(this.billService.create(bill));
        this.snackBar.open('Conta criada com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      }

      this.router.navigate(['/contas']);

    } catch (err) {
      console.error('Falha ao salvar a conta', err);
      this.snackBar.open('Erro ao salvar a conta', 'Fechar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  }

  cancel() {
    this.router.navigate(['/contas']);
  }
}
