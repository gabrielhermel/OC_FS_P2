import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { ChartConfiguration, ChartData, Chart } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';


// Base pie chart palette (first six colors used as-is)
const BASE_CHART_COLORS = [
  '#956065', // rose taupe
  '#B8CBE7', // powder blue
  '#793D52', // quinacridone magenta
  '#9780A1', // mountbatten pink
  '#BFE0F1', // columbia blue
  '#89A1DB', // vista blue
];

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  // Observable for the raw Olympics data
  public olympics$: Observable<OlympicCountry[] | null | undefined> = of(undefined);

  constructor(private olympicService: OlympicService) {}

  ngOnInit(): void {
    // Initialize data fetching
    this.olympicService.loadInitialData().subscribe();

    // Keep observable reference
    this.olympics$ = this.olympicService.getOlympics();

    // Fetch preprocessed medal totals for the chart
    this.olympicService.getTotalMedalsByCountry().subscribe(({ countryNames, countryTotalMedals }) => {
      this.chartData.labels = countryNames;
      this.chartData.datasets[0].data = countryTotalMedals;

      // Fill chart with base colors + generated ones if needed
      // Start with the base palette
      const backgroundColors = [...BASE_CHART_COLORS];
      // If there are more countries than base colors, generate extras
      if (countryNames.length > BASE_CHART_COLORS.length) {
        const extraCount = countryNames.length - BASE_CHART_COLORS.length;
        // Generate additional colors with hue variation around the palette’s average tone
        for (let i = 0; i < extraCount; i++) {
          // Cycle hue between 200–320° (cool-magenta range)
          const hue = 200 + ((i * 120) / extraCount);
          const sat = 40 + (i % 3) * 10; // subtle variation in saturation
          const light = 65 + (i % 2) * 10; // subtle variation in lightness
          backgroundColors.push(`hsl(${hue}, ${sat}%, ${light}%)`);
        }
      }

      this.chartData.datasets[0].backgroundColor = backgroundColors;
      this.chart?.update(); // refresh chart if already rendered
    });
  }

  // Chart instance reference (used to trigger updates)
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  // Chart type
  public chartType: 'pie' = 'pie';
  // Data model for the chart (filled dynamically)
  public chartData: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        data: [],
        // will be filled with preselected palette and additional colors auto-generated if necessary
        backgroundColor: [],
        borderWidth: 0, // remove borders between wedges
        borderColor: 'transparent', // ensures no visible gaps
      },
    ],
  };
  
  // Chart configuration and plugin options
  public chartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    layout: {
      padding: 0, // remove outer padding
    },
    plugins: {
      legend: {
        display: false, // will be replaced with custom legends
      },
      tooltip: {
        callbacks: {
          // Format tooltip as "Country: MedalCount"
          label: (context) => `${context.label}: ${context.parsed}`,
        },
      },
    },
  };
}
