import { Component, OnInit } from '@angular/core';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { map, Observable, of } from 'rxjs';
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  // Observable for the raw Olympics data initially set to undefined
  olympics$: Observable<OlympicCountry[] | null | undefined> = of(undefined);

  // Chart data Observable in ngx-charts format
  chartData$: Observable<{ name: string; value: number }[]> = this.olympicService
    .getTotalMedalsByCountry()
    .pipe(
      map(({ countryNames, countryTotalMedals }) =>
        countryNames.map((name, i) => ({ name, value: countryTotalMedals[i] }))
      )
    );

  // Chart color palette (first six custom, rest auto-generated)
  colorScheme: Color = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#956065', // rose-taupe
      '#B8CBE7', // powder-blue
      '#793D52', // quinacridone-magenta
      '#9780A1', // mountbatten-pink
      '#BFE0F1', // columbia-blue
      '#89A1DB', // vista-blue
    ],
  };

  constructor(private olympicService: OlympicService) {}

  ngOnInit(): void {
    // Initialize data fetching
    // No unsubscribe needed: HttpClient observables complete automatically
    this.olympicService.loadInitialData().subscribe();

    // Keep observable reference
    this.olympics$ = this.olympicService.getOlympics();
  }

  formatTooltip({ data }: any): string {
    return `${data.name}<br>\uE001${data.value}`; // \uE001 is the medal glyph
  }
}