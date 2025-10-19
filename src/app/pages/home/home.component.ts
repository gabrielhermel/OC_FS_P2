import { Component, OnDestroy, OnInit } from '@angular/core';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  // Minimum chart edge length
  private readonly MIN_CHART_SIZE = 300;
  // Reference to resize handler to remove it on destroy
  private readonly resizeListener = () => this.updateChartSize();
  // Chart color palette (first six custom, rest auto-generated)
  readonly colorScheme: Color = {
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

  // Will hold list of raw olympics data
  olympics: OlympicCountry[] = [];
  // Keep ref to unsubscribe manually
  // Not really needed for HttpClient, but good practice
  private olympicsSub?: Subscription;
  // Flags for loading status
  loading: boolean = true;
  loadError: boolean = false;
  // Object to hold total games and total countries
  globalStats: { totalGames: number; totalCountries: number } = {
    totalGames: 0,
    totalCountries: 0,
  };
  // Will hold chart data in ngx-charts format
  chartData: { name: string; value: number }[] = [];
  // Holds chart size
  chartView: [number, number] = [this.MIN_CHART_SIZE, this.MIN_CHART_SIZE];
  // Lookup object mapping country names to their IDs
  countryIdsByName: Record<string, number> = {};

  constructor(private olympicService: OlympicService, private router: Router) {}

  ngOnInit(): void {
    // Fetch and format data, update loading status
    this.loadData();
    // Listen for window resize events to recalculate chart dimensions
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    // Remove event listeners to prevent memory leaks
    window.removeEventListener('resize', this.resizeListener);
    //  Unsubscribing not required for HttpClient, but good pattern to have in place
    this.olympicsSub?.unsubscribe();
  }

  private loadData(): void {
    // Reset flags
    this.loading = true;
    this.loadError = false;
    // Save ref to subscription
    // No unsubscribe actually needed: HttpClient observables complete automatically
    this.olympicsSub = this.olympicService.getOlympics().subscribe({
      // Data returned successfully
      next: (data) => {
        // Assign response to local member
        this.olympics = data;
        // Set flag that loading has finished
        this.loading = false;
        // Parse and store global stats (total games, total countries)
        this.globalStats = this.olympicService.getGlobalStats(data);
        // Parse and hold data to be used in pie chart
        const { countryNames, countryTotalMedals } =
          this.olympicService.getTotalMedalsByCountry(data);
        // Format chart data and store in member
        this.chartData = countryNames.map((name, i) => ({
          name,
          value: countryTotalMedals[i],
        }));
        // Populate lookup obj to get country ids by their names
        this.countryIdsByName = this.olympicService.getIdsByName(data);
        // Defer setting initial chart size until first tick after view is rendered
        setTimeout(() => this.updateChartSize(), 0);
      },
      // Data failed to load
      error: () => {
        // Set flags to show error to user
        this.loading = false;
        this.loadError = true;
      },
    });
  }

  // Add medal glyph to tooltips
  formatTooltip({ data }: any): string {
    return `${data.name}<br>\uE001${data.value}`; // \uE001 is the medal glyph
  }

  // Distance pie chart labels from leader lines (en spaces - regular whitespace is clipped)
  labelFormatting(label: string): string {
    return ` ${label} `;
  }

  private updateChartSize(): void {
    // Last element above pie chart
    const statsContainer = document.querySelector(
      '.stats-container'
    ) as HTMLElement | null;

    // Safety check
    if (!statsContainer) return;

    // Find remaining visible vertical space under stats container
    const statsContainerBottBord =
      statsContainer.getBoundingClientRect().bottom;
    const statsContainerBottMarg =
      parseFloat(getComputedStyle(statsContainer).marginBottom) || 0;
    const remainVisibVertSpace =
      window.innerHeight - (statsContainerBottBord + statsContainerBottMarg);

    // Keeps chart square by using smaller of page width vs remaining vertical space
    // Available space value rounded to prevent subpixel values
    // Enforces minimum size
    const chartEdgeLenPx = Math.max(
      Math.floor(Math.min(window.innerWidth, remainVisibVertSpace)),
      this.MIN_CHART_SIZE
    );

    // ngx-charts expects an array [width, height]
    this.chartView = [chartEdgeLenPx, chartEdgeLenPx];
  }

  // Handle selection of pie slice to navigate to corresponding details page
  onSliceSelect(event: any): void {
    // Use country name from event to find its ID
    const countryId = this.countryIdsByName[event.name];
    // Navigate to details page for selected country
    this.router.navigate(['/details', countryId]);
  }

  // Handle clicks on chart labels (which don't emit select events)
  onChartClick(event: MouseEvent): void {
    const target = event.target as SVGTextElement | null;

    // Only react if the clicked element is a chart label
    if (target?.tagName.toLowerCase() === 'text' && target.textContent) {
      const countryName = target.textContent.trim();
      const countryId = this.countryIdsByName[countryName];

      if (countryId) {
        this.router.navigate(['/details', countryId]);
      }
    }
  }
}
