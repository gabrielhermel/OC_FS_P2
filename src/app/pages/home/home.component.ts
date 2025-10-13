import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  // Strongly typed observable
  public olympics$: Observable<OlympicCountry[] | null | undefined> = of(undefined);

  constructor(private olympicService: OlympicService) {}

  ngOnInit(): void {
    // Load the data (triggers HTTP call) and assign the observable
    this.olympics$ = this.olympicService.getOlympics();
    this.olympicService.loadInitialData().subscribe(); // triggers initial fetch
  }
}
