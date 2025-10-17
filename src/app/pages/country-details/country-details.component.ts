import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-country-details',
  templateUrl: './country-details.component.html',
  styleUrl: './country-details.component.scss'
})
export class CountryDetailsComponent implements OnInit {
  countryId!: number;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.countryId = Number(this.route.snapshot.paramMap.get('id'));
  }
}
