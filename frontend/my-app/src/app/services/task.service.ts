import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Task {
  id?: number;
  user_id?: number;
  title: string;
  description?: string;
  completed?: boolean;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = environment.backendUrl;

  private _tasksSource = new BehaviorSubject<Task[]>([]);
  tasks$: Observable<Task[]> = this._tasksSource.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private ngZone: NgZone
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  getTasks(): Observable<Task[]> {
    const headers = this.getAuthHeaders();
    console.log('[TaskService] getTasks: Sending GET request');
    return this.http.get<Task[]>(`${this.apiUrl}/api/tasks`, { headers }).pipe(
      tap((tasks) => {
        console.log('[TaskService] getTasks: Received tasks from backend.');
        this.ngZone.run(() => {
          this._tasksSource.next(tasks);
        });
      }),
      catchError(this.handleError)
    );
  }

  addTask(task: { title: string; description?: string; completed?: boolean }): Observable<Task> {
    const headers = this.getAuthHeaders();
    console.log('[TaskService] addTask: Sending POST request.');
    return this.http.post<any>(`${this.apiUrl}/api/tasks`, task, { headers }).pipe(
      map(response => response.task), // <<<--- THIS IS THE CRITICAL LINE!
      tap((newTask: Task) => {
        console.log('[TaskService] addTask: Received new task from backend.');
        this.ngZone.run(() => {
          const currentTasks = this._tasksSource.getValue();
          this._tasksSource.next([newTask, ...currentTasks]);
        });
      }),
      catchError(this.handleError)
    );
  }

  updateTask(id: number, updates: { title?: string; description?: string; completed?: boolean }): Observable<any> {
    const headers = this.getAuthHeaders();
    console.log(`[TaskService] updateTask: Sending PUT request for ID ${id}.`);
    return this.http.put(`${this.apiUrl}/api/tasks/${id}`, updates, { headers }).pipe(
      tap(() => {
        this.ngZone.run(() => {
          const currentTasks = this._tasksSource.getValue();
          const updatedTasks = currentTasks.map(task => {
            if (task.id === id) {
              return { ...task, ...updates };
            }
            return task;
          });
          this._tasksSource.next(updatedTasks);
        });
      }),
      catchError(this.handleError)
    );
  }

  deleteTask(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    console.log(`[TaskService] deleteTask: Sending DELETE request for ID: ${id}.`);
    return this.http.delete(`${this.apiUrl}/api/tasks/${id}`, { headers }).pipe(
      tap(() => {
        this.ngZone.run(() => {
          const currentTasks = this._tasksSource.getValue();
          const filteredTasks = currentTasks.filter(task => task.id !== id);
          this._tasksSource.next(filteredTasks);
        });
      }),
      catchError(this.handleError)
    );
  }

  private handleError = (error: any): Observable<never> => {
    console.error('An API error occurred:', error);
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}\nDetails: ${error.error?.message || ''}`;
      if (error.status === 401) {
        errorMessage = 'Unauthorized: Please log in again.';
        this.authService.logout();
      } else if (error.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
    }
    return throwError(() => new Error(errorMessage));
  };
}