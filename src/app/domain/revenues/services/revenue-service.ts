import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RevenueModel } from '../models/revenue';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RevenueService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/revenue';

  getAll(): Observable<RevenueModel[]> {
    return this.http.get<RevenueModel[]>(this.apiUrl);
  }

  getById(id: number): Observable<RevenueModel> {
    return this.http.get<RevenueModel>(`${this.apiUrl}/${id}`);
  }

  create(receita: RevenueModel): Observable<RevenueModel> {
    return this.http.post<RevenueModel>(this.apiUrl, receita);
  }

  update(id: number, receita: RevenueModel): Observable<RevenueModel> {
    return this.http.put<RevenueModel>(`${this.apiUrl}/${id}`, receita);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
