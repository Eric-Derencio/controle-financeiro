import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BillModel } from '../models/Bill';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/bills'

  getAll(): Observable<BillModel[]> {
    return this.http.get<BillModel[]>(this.apiUrl);
  }

  getById(id: number): Observable<BillModel> {
    return this.http.get<BillModel>(`${this.apiUrl}/${id}`);
  }

  create(bill: BillModel): Observable<BillModel> {
    return this.http.post<BillModel>(this.apiUrl, bill);
  }

  update(id: number, bill: BillModel): Observable<BillModel> {
    return this.http.put<BillModel>(`${this.apiUrl}/${id}`, bill);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
