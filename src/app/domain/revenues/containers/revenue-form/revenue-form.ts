import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RevenueService } from '../../services/revenue-service';
import { RevenueModel } from '../../models/revenue';



@Component({
  selector: 'app-revenue-form',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,],
  templateUrl: './revenue-form.html',
  styleUrl: './revenue-form.scss'
})
export class RevenueForm implements OnInit {
private fb = inject(FormBuilder);
  private revenueService = inject(RevenueService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;

  form = this.fb.group({
    descricao: ['', Validators.required],
    dataRecebimento: ['', Validators.required],
    valor: [0, [Validators.required, Validators.min(0.01)]],
    observacao: [''],
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const paramId = params.get('id');
      this.id = paramId ? +paramId : null;

      if (this.id) {
        this.revenueService.getById(this.id).subscribe((revenue) => {
          this.form.patchValue({
            descricao: revenue.descricao,
            dataRecebimento: revenue.dataRecebimento,
            valor: revenue.valor,
            observacao: revenue.observacao || '',
          });
        });
      } else {
        this.form.reset({
          descricao: '',
          dataRecebimento: '',
          valor: 0,
          observacao: '',
        });
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const revenue: RevenueModel = this.form.value as RevenueModel;

      if (this.id) {
        this.revenueService.update(this.id, revenue).subscribe({
          next: () => this.router.navigate(['/receita']),
          error: (err) => console.error('Erro ao atualizar receita', err),
        });
      } else {
        this.revenueService.create(revenue).subscribe({
          next: () => this.router.navigate(['/receita']),
          error: (err) => console.error('Erro ao salvar receita', err),
        });
      }
    }
  }

  cancel() {
    this.router.navigate(['/receitas']);
  }
}
