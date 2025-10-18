import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class CountryDetailsComponent implements OnInit, OnDestroy {
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

  // Custom single-line color scheme for chart
  readonly colorScheme: Color = {
    name: 'singleLine',
    selectable: false,
    group: ScaleType.Ordinal,
    domain: ['#793D52'],
  };

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

    // Create observable that fetches a single country's detail object
    this.detailsSub = this.olympicService.getCountryDetailsById(this.countryId).subscribe({
      // HTTP request successful
      next: (details) => {
        // If no country was found matching the id parameter set flags and show error
        if (!details) {
          this.loading = false;
          this.loadError = true;
          this.errorMessage = `No country was not found with the ID ${this.countryId}.`;
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
      },
      // HTTP request failed
      error: () => {
        this.loading = false;
        this.loadError = true;
        this.errorMessage = 'An error has occurred. Please try again.';
      },
    });
  }

  ngOnDestroy(): void {
    //  Unsubscribing not required for HttpClient, but good pattern to have in place
    this.detailsSub?.unsubscribe();
  }

  // Tooltip format for line chart: show year and medal count with glyph
  formatTooltip({ name, value }: any): string {
    return `${name}<br>\uE001 ${value}`;
  }
}
