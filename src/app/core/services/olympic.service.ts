import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { OlympicCountry } from '../models/Olympic';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private readonly olympicUrl = './assets/mock/olympic.json';

  constructor(private http: HttpClient) {}

  // Fetch full list of Olympic countries
  getOlympics() {
    return this.http.get<OlympicCountry[]>(this.olympicUrl).pipe(
      catchError((error) => {
        console.error('Failed to load Olympic data:', error);
        return throwError(() => error); // Let the component handle the error
      })
    );
  }

  // Compute medals per country from the full list
  getTotalMedalsByCountry(olympics: OlympicCountry[]) {
    const countryNames: string[] = [];
    const countryTotalMedals: number[] = [];
    // Iterate through each country to extract data
    for (const country of olympics) {
      // Store country name
      countryNames.push(country.country);
      // Compute total medals across all participations
      const totalMedals = country.participations.reduce(
        (total, p) => total + (p.medalsCount ?? 0),
        0
      );
      // Store computed total
      countryTotalMedals.push(totalMedals);
    }
    // Return chart-friendly data structure
    return { countryNames, countryTotalMedals };
  }

  // Compute global stats (total number of games (unique years), number of countries)
  getGlobalStats(olympics: OlympicCountry[]) {
    // Total countries: number of entries in list
    const totalCountries = olympics.length;
    // Collect all years from all countries’ participations
    const allYears = olympics.flatMap((c) => c.participations.map((p) => p.year));
    // Use Set to count unique years
    const totalGames = new Set(allYears).size;
    return { totalGames, totalCountries };
  }
}
