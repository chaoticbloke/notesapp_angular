import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Note } from '../interface/note';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { CustomHttpResponse } from '../interface/custom-http-response';
import { AppState } from '../interface/app-state';
interface ApiData {
  statusCode: number;
  data: [];
}
@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private readonly apiUrl = 'http://localhost:9999/note';
  constructor(private http: HttpClient) {}

  //use of CustomHttpResponse<>
  notes$ = <Observable<CustomHttpResponse>>(
    this.http.get<CustomHttpResponse>(this.apiUrl + '/all').pipe(
      tap((res) => console.log('TAP operator :', res)),
      catchError((err) => this.handleError(err))
    )
  );

  private handleError(err: HttpErrorResponse): Observable<any> {
    console.error('API Error:', err);

    // Map HttpErrorResponse → CustomHttpResponse
    const errorResponse = {
      // timeStamp: new Date(),
      // statusCode: err.status || 500,
      // message: err.message || 'Something went wrong',
      // reason: err.error?.reason || err.statusText || 'Unknown error',
      // developerMessage:
      //   err.error?.developerMessage || 'Unexpected error occurred',
      //notes: null,
    };

    // Option 1: propagate as observable error
    // return throwError(() => errorResponse);

    // Option 2 (more robust): return safe object so UI can handle gracefully
    return of(errorResponse);
  }
  createNote(note: Note): Observable<AppState<CustomHttpResponse>> {
    console.log('createNote service', note);
    return this.http.post<AppState<CustomHttpResponse>>(
      `${this.apiUrl}/create`,
      note
    );
  }

  updateNote(note: Note) {
    return this.http.put(this.apiUrl, note);
  }

  deleteNote(noteId: number) {
    return this.http.delete(`${this.apiUrl}/${noteId}`, {
      observe: 'response',
    });
  }
}
