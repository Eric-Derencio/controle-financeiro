import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout').then(m => m.Layout),
    children: [{
      path: '',
      redirectTo: 'projecoes',
      pathMatch: 'full'
    },
    {
      path: 'projecoes',
      loadComponent: () => import('./domain/projections/projection/projection').then(m => m.Projection)
    },
    {
      path: 'receita',
      loadComponent: () => import('./domain/revenues/revenue/revenue').then(m => m.Revenue)
    },
    {
      path: 'contas',
      loadComponent: () => import('./domain/bills/containers/bill-list/bill-list').then(m => m.BillList)
    },
    {
      path: 'contas/novo',
      loadComponent: () => import('./domain/bills/containers/bill-form/bill-form').then(m => m.BillForm)
    },
    {
      path: 'contas/:id/editar',
      loadComponent: () => import('./domain/bills/containers/bill-form/bill-form').then(m => m.BillForm)
    },
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
