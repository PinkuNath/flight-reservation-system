# Flight Reservation System

A full-stack flight reservation web application built using **Java, Spring Boot, Spring Security, and PostgreSQL**. The application allows users to register, log in, search available flights, make reservations, manage their bookings, and view passenger and seat details.

## Features

### User Authentication
- User registration and login
- Password hashing using BCrypt
- Session-based authentication using Spring Security
- Logout and session restoration
- Protected booking endpoints

### Flight Search
- Search flights between supported source and destination cities
- View available flight options, timings, and fares
- Backend-managed flight catalog

### Flight Booking
- Book flights for multiple passengers
- Enter individual passenger details
- Choose seat preferences independently for each passenger
- Additional fare for window-seat selection
- Automatic fare calculation on the backend
- Unique boarding number generation for passengers

### My Bookings
- View bookings belonging to the authenticated user
- View booking and passenger details
- View individual seat preferences and fare information
- Retrieve a specific booking with ownership verification

## Tech Stack

| Category          | Technologies                         |
|-------------------|--------------------------------------|
| Language          | Java 17                              |
| Backend           | Spring Boot                          |
| Security          | Spring Security                      |
| Authentication    | Session-based authentication, BCrypt |
| Database          | PostgreSQL                           |
| ORM               | Spring Data JPA, Hibernate           |
| Build Tool        | Maven                                |
| Frontend          | HTML, CSS, JavaScript                |
| Development Tools | IntelliJ IDEA, Git, GitHub           |

## Project Structure

```text
flight-reservation/
├── src/
│   ├── main/
│   │   ├── java/com/pinkunath/flightreservation/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   │   ├── request/
│   │   │   │   └── response/
│   │   │   ├── entity/
│   │   │   ├── exception/
│   │   │   ├── repository/
│   │   │   └── service/
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── assets/
│   │       │   ├── css/
│   │       │   ├── js/
│   │       │   ├── index.html
│   │       │   └── confirmation.html
│   │       └── application.properties
│   └── test/
├── .gitignore
├── mvnw
├── mvnw.cmd
└── pom.xml
```

## Backend Architecture

The backend follows a layered architecture:

- **Controller:** Handles HTTP requests and responses.
- **Service:** Contains application logic, authentication, booking operations, and fare calculations.
- **Repository:** Handles database operations using Spring Data JPA.
- **Entity:** Represents database entities and their relationships.
- **DTO:** Separates API request and response structures from database entities.
- **Config:** Contains Spring Security and password encoder configuration.
- **Exception:** Handles application errors and provides consistent API error responses.

## Database

The application uses PostgreSQL with Spring Data JPA and Hibernate.

Main entities:

- `User` – stores registered user information and roles.
- `Booking` – stores reservation details and is associated with a user.
- `Passenger` – stores passenger information and individual seat preferences for a booking.

Database credentials are supplied through environment variables rather than hardcoded in the application configuration.

## Getting Started

### Prerequisites

- Java 17 or later
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/PinkuNath/flight-reservation-system.git
cd flight-reservation-system
```

### 2. Create the PostgreSQL database

Create a database named:

```sql
CREATE DATABASE p001_flight_reservation;
```

### 3. Configure environment variables

Configure the following environment variables in your IDE or operating system:

| Variable      | Description                    |
|---------------|--------------------------------|
| `DB_URL`      | PostgreSQL JDBC connection URL |
| `DB_USERNAME` | PostgreSQL database username   |
| `DB_PASSWORD` | PostgreSQL database password   |

Example local configuration:

```text
DB_URL=jdbc:postgresql://localhost:5432/p001_flight_reservation
DB_USERNAME=postgres
DB_PASSWORD=your_database_password
```

Do not commit actual database credentials to GitHub.

### 4. Run the application

Using the Maven Wrapper:

**Windows PowerShell**

```powershell
.\mvnw.cmd spring-boot:run
```

**Linux / macOS**

```bash
./mvnw spring-boot:run
```

The application will be available at:

```text
http://localhost:8080
```

## API Overview

Base URL: `/api`

| Method | Endpoint         | Purpose                                 |
|--------|------------------|-----------------------------------------|
| POST   | `/auth/register` | Register a user                         |
| POST   | `/auth/login`    | Authenticate a user                     |
| GET    | `/auth/me`       | Retrieve the current authenticated user |
| POST   | `/auth/logout`   | Log out                                 |
| GET    | `/flights`       | Retrieve available flights              |
| POST   | `/bookings`      | Create a booking                        |
| GET    | `/bookings`      | Retrieve the current user's bookings    |
| GET    | `/bookings/{id}` | Retrieve a specific owned booking       |

Protected endpoints require an authenticated session.

## Security

- Passwords are stored as BCrypt hashes.
- Spring Security handles authentication.
- Session-based authentication is used to maintain login state.
- Protected endpoints require authentication.
- Booking retrieval checks ownership to prevent users from accessing other users' bookings.
- Database credentials are supplied externally through environment variables.

## Future Improvements

- Cloud deployment
- Integration with a live flight data provider
- Booking cancellation
- Improved automated testing
- Additional administrative functionality

## Author

**Pinku Nath**

B.Tech Computer Science and Engineering student interested in Java backend development and AI.

- GitHub: [PinkuNath](https://github.com/PinkuNath)
- LinkedIn: [pinku-nath](https://www.linkedin.com/in/pinku-nath/)

---

*This project is being developed as a practical full-stack application to explore backend development, database management, authentication, and software architecture using Java and Spring Boot.*