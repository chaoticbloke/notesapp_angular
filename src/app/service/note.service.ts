import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Note } from '../interface/note';
import {
  BehaviorSubject,
  catchError,
  Observable,
  map,
  retry,
  tap,
  throwError,
} from 'rxjs';
import { CustomHttpResponse } from '../interface/custom-http-response';
import { AppState } from '../interface/app-state';
import { DataState } from '../enums/data-state';
interface ApiData {
  statusCode: number;
  data: [];
}
@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private notesSubject = new BehaviorSubject<AppState<Note[]>>({
    dataState: DataState.LOADING,
  });
  notesObs$ = this.notesSubject.asObservable();

  private readonly apiUrl = 'http://localhost:9999/note';
  constructor(private http: HttpClient) {
    this.fetchNotes().subscribe();
  }

  fetchNotes() {
    return this.http.get(this.apiUrl + '/all').pipe(
      map((response: any) => {
        console.log('fetch all notes server response :', response);
        const appState: AppState<Note[]> = {
          dataState: DataState.LOADED,
          data: response.notes,
        };
        return appState;
      }),
      tap((notes) => this.notesSubject.next(notes)),
      catchError(this.handleError)
    );
  }

  createNote(note: Note): Observable<AppState<Note[]>> {
    console.log('create Note called with note', note);
    return this.http.post<AppState<Note[]>>(`${this.apiUrl}/create`, note).pipe(
      tap((response: any) => {
        const currentState = this.notesSubject.getValue();
        const newNotesList = [...(currentState.data || []), response.notes[0]];

        const updatedAppState: AppState<Note[]> = {
          ...currentState,
          dataState: DataState.LOADED,
          data: newNotesList,
        };
        this.notesSubject.next(updatedAppState);
      }),
      catchError(this.handleError)
    );
  }

  private handleError(err: HttpErrorResponse): Observable<any> {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      //client side error
      errorMessage = `Network Error : ${err.error.message}`;
    } else {
      //backend error
      switch (err.status) {
        case 0:
          errorMessage =
            'Unable to connect. Please check your internet or server.';
          break;
        case 400:
          errorMessage = 'Bad request. Please check your input.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = `Unexpected error: ${err.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
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
