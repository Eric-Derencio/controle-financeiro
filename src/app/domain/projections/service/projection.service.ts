import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectionModel } from '../model/Projection';

@Injectable({
  providedIn: 'root'
})
export class ProjectionService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000/projecoes';

  getAll(): Observable<ProjectionModel[]> {
    return this.http.get<ProjectionModel[]>(this.api);
  }

  create(entry: ProjectionModel): Observable<ProjectionModel> {
    return this.http.post<ProjectionModel>(this.api, entry);
  }

  update(id: number, entry: ProjectionModel): Observable<ProjectionModel> {
    return this.http.put<ProjectionModel>(`${this.api}/${id}`, entry);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
