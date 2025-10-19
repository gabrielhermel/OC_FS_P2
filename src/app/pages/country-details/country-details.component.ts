import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { Subscription } from 'rxjs';
import { CountryDetails } from 'src/app/core/models/CountryDetails';
import { OlympicService } from 'src/app/core/services/olympic.service';

@Component({
  selector: 'app-country-details',
  templateUrl: './country-details.component.html',
  styleUrl: './country-details.component.scss'
})
export class CountryDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  // UI state flags
  // True until data received or error thrown
  loading = true;
  // True if HTTP request fails or ID not found
  loadError = false;
  // Holds user-facing error message
  errorMessage = '';

  // Route param: id from '/details/:id'
  countryId!: number;

  // Holds data returned by olympics service (stays null if not found)
  details: CountryDetails | null = null;
  
  // Hold chart y-axis min and max values
  yScaleMin: number = 0;
  yScaleMax: number = 0;

  // Keep ref to unsubscribe manually
  // Not really needed for HttpClient, but good practice
  private detailsSub?: Subscription;

  // Single-line color scheme for chart randomly selected from palette
  readonly colorScheme: Color = {
    name: 'singleLine',
    selectable: false,
    group: ScaleType.Ordinal,
    domain: [
      (colors => colors[Math.floor(Math.random() * colors.length)])([
        '#956065', // rose-taupe
        '#B8CBE7', // powder-blue
        '#793D52', // quinacridone-magenta
        '#9780A1', // mountbatten-pink
        '#BFE0F1', // columbia-blue
        '#89A1DB', // vista-blue
      ])
    ],
  };

  // Used to set aspect ratio for line chart
  private readonly CHART_ASPECT_RATIO = 16 / 9;
  // Reference to resize handler to remove it on destroy
  private readonly resizeListener = () => this.updateChartSize();
  // Minimum chart dimensions
  private readonly MIN_CHART_WIDTH = 400;
  private readonly MIN_CHART_HEIGHT = 225;
  // Chart scaling factor
  private readonly CHART_SCALE_FACTOR = 0.8;
  // Holds chart dimensions
  chartView: [number, number] = [this.MIN_CHART_WIDTH, this.MIN_CHART_HEIGHT];

  constructor(private route: ActivatedRoute, private olympicService: OlympicService) {}

  ngOnInit(): void {
    // Read id route parameter using Number() to coerce string to number
    this.countryId = Number(this.route.snapshot.paramMap.get('id'));

    // Validate id before making HTTP call
    if (!Number.isInteger(this.countryId) || this.countryId <= 0) {
      this.loading = false;
      this.loadError = true;
      this.errorMessage = `The specified country ID (${ this.countryId }) is not valid.`;
      return;
    }

    // Create a subscription to fetch a single country's detail object
    this.detailsSub = this.olympicService.getCountryDetailsById(this.countryId).subscribe({
      // HTTP request successful
      next: (details) => {
        // If no country was found matching the id parameter set flags and show error
        if (!details) {
          this.loading = false;
          this.loadError = true;
          this.errorMessage = `No country was found with the ID ${this.countryId}.`;
          return;
        }

        // Store details
        this.details = details;

        // Get max and min medal values for chart y-axis
        const medalValues = this.details.medalHistory.map((p) => p.value);
        const minVal = Math.min(...medalValues);
        const maxVal = Math.max(...medalValues);
        // Add 5% padding above and below
        const padding = (maxVal - minVal) * 0.05;
        this.yScaleMin = Math.max(0, minVal - padding);
        this.yScaleMax = maxVal + padding;

        // Turn loading off
        this.loading = false;
        this.loadError = false;

        // Defer setting initial chart size until first tick after content is fully loaded
        setTimeout(() => this.updateChartSize(), 0);
      },
      // HTTP request failed
      error: () => {
        this.loading = false;
        this.loadError = true;
        this.errorMessage = 'An error has occurred. Please try again.';
      },
    });
  }

  ngAfterViewInit(): void {
    // Listen for window resize events to recalculate chart dimensions
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    // Remove event listeners to prevent memory leaks
    window.removeEventListener('resize', this.resizeListener);
    //  Unsubscribing not required for HttpClient, but good pattern to have in place
    this.detailsSub?.unsubscribe();
  }

  private updateChartSize(): void {
    // Last element above line chart
    const statsContainer = document.querySelector('.stats-container') as HTMLElement | null;

    // Safety check
    if (!statsContainer) return;

    // Find remaining visible vertical space under stats container
    const statsContainerBottom = statsContainer.getBoundingClientRect().bottom;
    const statsContainerBottMargin = parseFloat(getComputedStyle(statsContainer).marginBottom) || 0;
    const remainVisibVertSpace = window.innerHeight - (statsContainerBottom + statsContainerBottMargin);

    // Calculate max possible height based on aspect ratio
    const idealHeight = Math.min(remainVisibVertSpace, window.innerWidth / this.CHART_ASPECT_RATIO);
    const idealWidth = idealHeight * this.CHART_ASPECT_RATIO;

    // Scale down chart size by predefined factor while enforcing minimum size
    const chartWidth = Math.max(Math.floor(idealWidth * this.CHART_SCALE_FACTOR), this.MIN_CHART_WIDTH);
    const chartHeight = Math.max(Math.floor(idealHeight * this.CHART_SCALE_FACTOR), this.MIN_CHART_HEIGHT);

    // ngx-charts expects an array [width, height]
    this.chartView = [chartWidth, chartHeight];
  }

  // Format Y-axis ticks as integers only (hide decimals)
  yAxisTickFormatting(value: number): string {
    return Number.isInteger(value) ? value.toString() : '';
  }
}
