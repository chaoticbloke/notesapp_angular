import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Note } from '../interface/note';
import {
  BehaviorSubject,
  catchError,
  Observable,
  map,
  tap,
  throwError,
  finalize,
} from 'rxjs';
import { CustomHttpResponse } from '../interface/custom-http-response';
import { AppState } from '../interface/app-state';
import { DataState } from '../enums/data-state';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private readonly apiUrl = 'http://localhost:9999/note';

  private notesSubject = new BehaviorSubject<AppState<Note[]>>({
    dataState: DataState.LOADING,
    data: null,
    error: null,
  });

  public notesObs$ = this.notesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadNotes();
  }

  /**
   * Load all notes from server
   */
  private loadNotes(): void {
    this.setLoadingState();

    this.http
      .get<any>(`${this.apiUrl}/all`)
      .pipe(
        map((response) => ({
          dataState: DataState.LOADED,
          data: response.notes || [],
          error: null,
        })),
        catchError((error) => {
          const errorMessage = this.handleError(error);
          this.setErrorState(errorMessage);
          return throwError(() => error);
        })
      )
      .subscribe((state) => {
        this.notesSubject.next(state);
      });
  }

  /**
   * Create a new note
   */
  createNote(note: Note): Observable<Note> {
    return this.http.post<any>(`${this.apiUrl}/create`, note).pipe(
      map((response) => response.notes[0]),
      tap((newNote) => {
        const currentState = this.notesSubject.getValue();
        const updatedNotes = [...(currentState.data || []), newNote];

        this.notesSubject.next({
          dataState: DataState.LOADED,
          data: updatedNotes,
          error: null,
        });
      }),
      catchError((error) => {
        const errorMessage = this.handleError(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Update an existing note
   */
  updateNote(note: Note): Observable<Note> {
    if (!note.id) {
      return throwError(() => new Error('Note ID is required for update'));
    }

    return this.http.put<any>(`${this.apiUrl}/update/${note.id}`, note).pipe(
      map((response) => response.notes[0] || note),
      tap((updatedNote) => {
        const currentState = this.notesSubject.getValue();
        const updatedNotes = (currentState.data || []).map((n) =>
          n.id === updatedNote.id ? updatedNote : n
        );

        this.notesSubject.next({
          dataState: DataState.LOADED,
          data: updatedNotes,
          error: null,
        });
      }),
      catchError((error) => {
        const errorMessage = this.handleError(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Delete a note by ID
   */
  deleteNote(noteId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${noteId}`).pipe(
      tap(() => {
        const currentState = this.notesSubject.getValue();
        const updatedNotes = (currentState.data || []).filter(
          (note) => note.id !== noteId
        );

        this.notesSubject.next({
          dataState: DataState.LOADED,
          data: updatedNotes,
          error: null,
        });
      }),
      catchError((error) => {
        const errorMessage = this.handleError(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Filter notes by priority level
   */
  filterNotesByPriority(priority: string): Observable<Note[]> {
    return this.notesObs$.pipe(
      map((state) => {
        if (!state.data) return [];

        if (priority === 'all') {
          return state.data;
        }

        return state.data.filter(
          (note) => note.level.toUpperCase() === priority.toUpperCase()
        );
      })
    );
  }

  /**
   * Get a single note by ID
   */
  getNoteById(noteId: number): Observable<Note | undefined> {
    return this.notesObs$.pipe(
      map((state) => state.data?.find((note) => note.id === noteId))
    );
  }

  /**
   * Refresh notes from server
   */
  refreshNotes(): void {
    this.loadNotes();
  }

  /**
   * Set loading state
   */
  private setLoadingState(): void {
    const currentState = this.notesSubject.getValue();
    this.notesSubject.next({
      ...currentState,
      dataState: DataState.LOADING,
    });
  }

  /**
   * Set error state
   */
  private setErrorState(errorMessage: string): void {
    this.notesSubject.next({
      dataState: DataState.ERROR,
      data: null,
      error: errorMessage,
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleError(err: HttpErrorResponse): string {
    let errorMessage = '';

    if (err.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Network Error: ${err.error.message}`;
    } else {
      // Backend error
      switch (err.status) {
        case 0:
          errorMessage =
            'Unable to connect. Please check your internet or server.';
          break;
        case 400:
          errorMessage =
            err.error?.message || 'Bad request. Please check your input.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage =
            err.error?.message || `Unexpected error: ${err.message}`;
      }
    }

    return errorMessage;
  }
}
