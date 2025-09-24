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
      loadComponent: () => import('./domain/revenues/containers/revenue-list/revenue-list').then(m => m.RevenueList)
    },
    {
      path: 'receita/novo',
      loadComponent: () => import('./domain/revenues/containers/revenue-form/revenue-form').then(m => m.RevenueForm)
    },
    {
      path: 'receita/:id/editar',
      loadComponent: () => import('./domain/revenues/containers/revenue-form/revenue-form').then(m => m.RevenueForm)
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
