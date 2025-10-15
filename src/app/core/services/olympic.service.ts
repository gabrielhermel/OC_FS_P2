import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { OlympicCountry } from '../models/Olympic';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  // BehaviorSubject holds:
  // - undefined: data not loaded yet
  // - null: error loading data
  // - OlympicCountry[]: loaded data
  private olympics$ = new BehaviorSubject<OlympicCountry[] | null | undefined>(undefined);

  constructor(private http: HttpClient) {}

  // Loads data from JSON:
  // - updates the internal BehaviorSubject (side effect)
  // - returns an Observable of OlympicCountry[] so components can react to the HTTP call
  loadInitialData(): Observable<OlympicCountry[]> {
    return this.http.get<OlympicCountry[]>(this.olympicUrl).pipe(
      tap((value) => this.olympics$.next(value)),
      catchError((error) => {
        console.error('Failed to load Olympic data:', error);
        this.olympics$.next(null); // update the BehaviorSubject for subscribers
        // Observable completes immediately, no error is propagated to subscribers
        return EMPTY;
      })
    );
  }

  // Exposes the BehaviorSubject as a read-only observable
  getOlympics(): Observable<OlympicCountry[] | null | undefined> {
    return this.olympics$.asObservable();
  }

  // Returns an observable that emits two arrays: country names and their total medal counts
  getTotalMedalsByCountry(): Observable<{ countryNames: string[]; countryTotalMedals: number[] }> {
    return this.getOlympics().pipe(
      map((list) => {
        // Handle cases where data is null or undefined
        if (!list) return { countryNames: [], countryTotalMedals: [] };
        const countryNames: string[] = [];
        const countryTotalMedals: number[] = [];
        // Iterate through each country to extract data
        for (const country of list) {
          // Store country name
          countryNames.push(country.country);
          // Compute total medals across all participations
          const totalMedals = country.participations.reduce(
            (total, participation) => total + (participation.medalsCount ?? 0),
            0
          );
          // Store computed total
          countryTotalMedals.push(totalMedals);
        }
        // Return chart-friendly data structure
        return { countryNames, countryTotalMedals };
      })
    );
  }
}
