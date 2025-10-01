import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RevenueService } from '../../services/revenue-service';
import { RevenueModel } from '../../models/revenue';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom, of, Subject, switchMap, takeUntil } from 'rxjs';
import { MatCardModule } from "@angular/material/card";




@Component({
  selector: 'app-revenue-form',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCardModule,
  ],
  templateUrl: './revenue-form.html',
  styleUrl: './revenue-form.scss'
})
export class RevenueForm implements OnInit,OnDestroy {
  private fb = inject(FormBuilder);
  private revenueService = inject(RevenueService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private destroyed$ = new Subject<void>();

  id: number | null = null;

  form = this.fb.group({
    descricao: ['', Validators.required],
    dataRecebimento: ['', Validators.required],
    valor: [0, [Validators.required, Validators.min(0.01)]],
    observacao: [''],
  });

  get isEditing(): boolean {
    return this.id !== null;
  }


  ngOnInit(): void {
    this.loadDataForEdit();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private loadDataForEdit():void {
    this.route.paramMap.pipe(takeUntil(this.destroyed$),switchMap(params =>{
      const paramId = params.get('id');
      this.id = paramId ? +paramId : null;
      return this.id? this.revenueService.getById(this.id): of(null);
    })).subscribe(revenue => {
      if(revenue){
        this.form.patchValue({
          ...revenue
        })
      }else{
        this.form.reset();
      }
    });
  }

  private buildRevenueFromForm():RevenueModel{
    const formValue = this.form.getRawValue();
    return{
      ...formValue
    }
  }


  async onSubmit() {
    if (this.form.invalid) return;

    const revenue = this.buildRevenueFromForm();

    try{
      if(this.isEditing){
        await firstValueFrom(this.revenueService.update(this.id!,revenue));
        this.snackBar.open('Conta atualizada com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      } else {
        await firstValueFrom(this.revenueService.create(revenue));
        this.snackBar.open('Conta criada com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      }
    } catch (err){
      console.error('Falha ao salvar Receita',err);
      this.snackBar.open('Erro ao salvar a conta', 'Fechar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
    this.router.navigate(['/receitas']);
  }

  cancel() {
    this.router.navigate(['/receitas']);
  }
}
