// Represents all details for a single country's Olympic statistics
export interface CountryDetails {
  name: string;
  participationCount: number;
  totalMedals: number;
  totalAthletes: number;
  medalHistory: { name: string; value: number }[]; // for ngx-charts line chart
}
