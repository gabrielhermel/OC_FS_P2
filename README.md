# Olympic Games Dashboard

This Angular web application is being developed for **TéléSport** by **DelivWeb** to provide an interactive Olympic Games dashboard.  
It lets users explore medal statistics from past Olympic Games through data visualizations.

---

## Overview

The application consists of two fully responsive pages:

### 1. Home Page

**Route:** `/`

- Displays a title box: **“Medals per Country”**  
- Shows two statistics:
  - **Number of Games** (unique Olympic years present in dataset)
  - **Number of Countries** that participated  
- Presents a **pie chart** showing the **total number of medals per country** across all years.
  - The chart is dynamically sized and centered within the viewport
  - Each slice and its label are clickable; clicking navigates to the country’s detail page
  - Tooltips display a medal glyph followed by the medal count
  - Resizes dynamically with the window
- Handles loading and error states with a spinner and user-friendly messages

---

### 2. Country Details Page

**Route:** `/details/:id`

- Displays a title box: **Country Name**
- Shows three statistics:
  - **Number of Entries** (total participations)
  - **Total Medals**
  - **Total Athletes**
- Includes a **line chart** presenting the country’s medal counts over time:
  - **X-axis:** Years (labeled *Dates*)
  - **Y-axis:** Number of medals
  - Maintains a **16:9 aspect ratio** and resizes dynamically with the window
- Provides user feedback for invalid IDs or network errors

---

### 3. Not Found Page

**Route:** `**` (fallback)

Displays a simple message when the user navigates to a non-existent route.

---

## Header & Navigation

A persistent header is present on all pages. It contains:

- **Title:** “Olympic Games App”
- **Navigation:** a single **Home** button

The **Home** button is the primary way to leave the details page and return to the home page.  
It links to the root route: `/`.

---

## Architecture and Design

The app is built with **Angular** and **RxJS**, following best practices for modularity and reusability.

- **Services** dedicated for handling all data fetching and transformations
- **Components** manage presentation and user interactions
- **RxJS Observables** handle asynchronous data flow
- **Strong typing** for data structures throughout using TypeScript interfaces
- **unsubscribe** done manually, even for Observables which complete automatically
- **ngx-charts** used for data visualization, with customized appearance via SCSS
- **Responsive chart sizing** using viewport calculations
- **Error handling** for all HTTP requests
- **Logic**, **Data**, and **Presentation** are clearly separated
- **Notes**:
  - All pages automatically load their data; no refresh required
  - The app assumes an online environment (no offline caching implemented)

---

### Main Service: `OlympicService`

| Method | Description |
|--------|--------------|
| `getOlympics()` | Loads the complete dataset (`./assets/mock/olympic.json`) |
| `getTotalMedalsByCountry()` | Aggregates total medals per country |
| `getGlobalStats()` | Calculates total number of games and countries |
| `getIdsByName()` | Builds a lookup table for navigation |
| `getCountryDetailsById(id)` | Returns detailed statistics for a specific country |

All HTTP errors are caught and logged, with user-facing messages displayed.

---

## Data Models

**OlympicCountry**
```ts
{
  id: number;
  country: string;
  participations: Participation[];
}
```

**Participation**
```ts
{
  id: number;
  year: number;
  city: string;
  medalsCount: number;
  athleteCount: number;
}
```

**CountryDetails**
```ts
{
  name: string;
  participationCount: number;
  totalMedals: number;
  totalAthletes: number;
  medalHistory: { name: string; value: number }[];
}
```

---

## Behavior Summary

| Situation | Result |
|------------|---------|
| App loads | Dashboard appears after data fetch with spinner |
| Click on pie slice or label | Navigates to `/details/:id` for that country |
| Invalid country ID | Displays “No country found” message |
| Data fetch fails | Shows “An error has occurred. Please try again.” |
| Window resized | Charts automatically rescale |
| Unknown route | Redirected to Not Found page |

---

## Styling and User Experience

- Consistent color palette with blue and rose tones
- Fully responsive layout for both desktop and mobile
- Custom SCSS ensures unified appearance with clear visual elements and typography
- Spinner and error messages provide feedback during loading or connection issues
- Charts styled for clarity and readability in accordance with provided mock-ups
- Tooltips currently use default ngx-charts formatting due to version compatibility

---

## Run Notes

To run the project locally:

```bash
npm install
ng serve
```

Then open [http://localhost:4200](http://localhost:4200)
