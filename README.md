# SIT331 5.2HD – Aboriginal Art Gallery Discovery

## Overview

This project is my implementation of a backend service for an Aboriginal art gallery system, extended with a simple React frontend to improve usability.

The main idea of this project is to allow users to manage artworks and explore them using location-based features. Instead of only testing APIs, I wanted to show how the data could be used in a more practical way through a map interface.

---

## What I Implemented

### Backend (ASP.NET Core Web API)

- Created a REST API for artworks and locations
- Used PostgreSQL with Entity Framework Core
- Implemented CRUD operations for artworks
- Added a nearby discovery endpoint:
  

GET /api/discovery/nearby


- Used latitude and longitude to calculate distances
- Prevented JSON circular reference issues

---

### API Testing (Postman + Newman)
<img width="1293" height="1263" alt="image" src="https://github.com/user-attachments/assets/71bb4946-297f-4755-9c9b-d6773b00cfb6" />


- Built a full Postman collection
- Tested all endpoints:
- Create Artwork
- Get All Artworks
- Get by ID
- Update Artwork
- Delete Artwork
- Nearby search
- Exported:
- Postman collection
- Environment file
- Ran automated tests using Newman
- Generated HTML test report

---

### Frontend (React)
<img width="1891" height="1471" alt="image" src="https://github.com/user-attachments/assets/c22781d7-a464-4adc-8220-275e6dae01cb" />

- Built a simple React app using Vite
- Focused on a clean map-based layout instead of a form-heavy UI
- Integrated Google Maps API
- Displayed artworks as markers using location data
- Clicking an artwork:
- pans and zooms the map
- shows location visually
- Added nearby search using coordinates and radius
- Made the layout responsive

---

## Technologies Used

### Backend
- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL

### Frontend
- React (Vite)
- Google Maps JavaScript API

### Tools
- Postman
- Newman
- GitHub

---

## Project Structure


5.2HD
├── StreetArt # Backend (ASP.NET Core)
└── aboriginal-frontend # Frontend (React)


---

## How to Run

### Backend


cd StreetArt
dotnet run


---

### Frontend


cd aboriginal-frontend
npm install
npm run dev


---

## Environment Setup

Create a `.env` file inside the frontend folder:


VITE_GOOGLE_MAPS_API_KEY=your_api_key_here


The API key is not included for security reasons.

---

## Reflection

In this project, I tried to go beyond just building API endpoints. I wanted to show how the backend could be connected to a simple frontend to create a more realistic system.

The map integration helped demonstrate how location data can be used in a meaningful way, rather than just returning JSON responses.

---

<img width="1882" height="1420" alt="image" src="https://github.com/user-attachments/assets/35613c22-ecf0-4b43-8653-c8650aeaa1d9" />
## API Documentation

Swagger is used to explore and test the API.

I added simple XML comments to the controllers so that each endpoint shows a short description directly in Swagger.

This made it easier to quickly understand what each API does while testing.

## Author

Eunjin Kim  
Bachelor of Computer Science  
Deakin University
