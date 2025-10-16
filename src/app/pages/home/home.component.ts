import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { map, Observable, of } from 'rxjs';
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  // Observable for the raw Olympics data initially set to undefined
  olympics$: Observable<OlympicCountry[] | null | undefined> = of(undefined);

  // Observable for total games and total countries
  globalStats$ = this.olympicService.getGlobalStats();

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
  
  // Holds chart size
  chartView: [number, number] = [300, 300];

  // Reference to resize handler to remove it on destroy
  private readonly resizeListener = () => this.updateChartSize();

  constructor(private olympicService: OlympicService) {}

  ngOnInit(): void {
    // Initialize data fetching
    // No unsubscribe needed: HttpClient observables complete automatically
    this.olympicService.loadInitialData().subscribe();

    // Keep observable reference
    this.olympics$ = this.olympicService.getOlympics();

    // Listen for window resize events and recalculate chart dimensions
    window.addEventListener('resize', this.resizeListener);
  }

  ngAfterViewInit(): void {
    // Wait until first tick after view is fully rendered before setting initial chart size
    setTimeout(() => this.updateChartSize(), 0);
  }

  ngOnDestroy(): void {
    // Remove event listeners to prevent memory leaks
    window.removeEventListener('resize', this.resizeListener);
  }

  formatTooltip({ data }: any): string {
    return `${data.name}<br>\uE001${data.value}`; // \uE001 is the medal glyph
  }

  // Distance pie chart labels from leader lines (en spaces - regular whitespace is clipped)
  labelFormatting(label: string): string {
    return ` ${label} `;
  }

  private updateChartSize(): void {
    // Last element above pie chart
    const statsContainer = document.querySelector('.stats-container') as HTMLElement | null;

    // Safety check
    if (!statsContainer) return;

    // Find remaining visible vertical space under stats container
    const statsContainerBottBord = statsContainer.getBoundingClientRect().bottom;
    const statsContainerBottMarg = parseFloat(getComputedStyle(statsContainer).marginBottom) || 0;
    const remainVisibVertSpace = window.innerHeight - (statsContainerBottBord + statsContainerBottMarg);

    // Keeps chart square by using smaller of page width vs remaining vertical space
    // Scale to 80% of available space, rounded to prevent subpixel values
    // Enforces minimum of 300px
    const chartEdgeLenPx = Math.max(Math.floor(Math.min(window.innerWidth, remainVisibVertSpace)), 300);

    // ngx-charts expects an array [width, height]
    this.chartView = [chartEdgeLenPx, chartEdgeLenPx];
  }
}