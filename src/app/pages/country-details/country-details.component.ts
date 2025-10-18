import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  // Keep ref to unsubscribe manually
  // Not really needed for HttpClient, but good practice
  private detailsSub?: Subscription;

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
}
