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
  - All pages automatically load their data; no manual refresh is required
  - The app assumes an online environment (no offline caching implemented)
  - The provided project skeleton was built using **Angular 18.0.3**
    - To ensure stable integration and avoid significant refactoring, compatible NPM module versions were selected:
      - `"@angular/cdk": "^18.2.14"`
      - `"rxjs": "~7.8.0"`
      - `"@swimlane/ngx-charts": "^20.1.0"`

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

### Prerequisites

- **Git** (required to clone the repository):
  [https://git-scm.com/downloads](https://git-scm.com/downloads)
- **Node.js & npm** (required to install dependencies and run the dev server):
  [https://nodejs.org/en/download](https://nodejs.org/en/download)

---

### Cloning the Repository

- Open a terminal or command prompt at the folder where you want the project to be stored
  - In **File Explorer (Windows)** / **Finder (macOS)** / **your file manager (Linux)** right-click the desired folder and:
    - **macOS:** Select **Services**, and then **New Terminal at Folder**.  
    - **Windows:** Select **Open in Terminal**.  
    - **Linux:** Select **Open in Terminal**.  
  - **(Alternative)** If you already have a terminal or command prompt open, you can manually navigate to the folder by typing:  

    ```bash
    cd path/to/project/parent/folder
    ```
    (Replace `path/to/project/parent/folder` with the full path where you want the project saved.)
- Clone the repository

  ```bash
  git clone https://github.com/gabrielhermel/OC_FS_P2.git
  ```

---

### Installing Dependencies & Running the App

- Navigate into the project root folder (default folder name matches the repo name)

  ```bash
  cd OC_FS_P2
  ```
  (If you used a custom folder name while cloning, replace `OC_FS_P2` with that name in the command above.)

- Install dependencies and start the local development server

  ```bash
  npm install
  npx ng serve
  ```

- ***If*** `npx ng serve` is not available, install the Angular CLI globally and run again

  ```bash
  npm install -g @angular/cli
  ng serve
  ```

- Go to: [http://localhost:4200](http://localhost:4200)