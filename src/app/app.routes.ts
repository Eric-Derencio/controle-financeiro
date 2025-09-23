import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path:'',
    loadComponent: ()=> import('./shared/components/layout/layout').then(m=>m.Layout),
    children:[{
      path:'',
      redirectTo:'projecoes',
      pathMatch:'full'
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
      loadComponent: () => import('./domain/bills/bill/bill').then(m => m.Bill)
    },
  ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
