
package com.pinkunath.flightreservation.service;

import com.pinkunath.flightreservation.exception.InvalidBookingException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class FlightCatalog {

    public record FlightDetails(
            String name,
            String time,
            BigDecimal price
    ) {}

    private final List<FlightDetails> flights = List.of(
            new FlightDetails(
                    "Indigo",
                    "8:00 AM",
                    new BigDecimal("4000.00")
            ),
            new FlightDetails(
                    "Spice jet",
                    "1:00 PM",
                    new BigDecimal("4500.00")
            ),
            new FlightDetails(
                    "Air India",
                    "5:00 PM",
                    new BigDecimal("5000.00")
            )
    );

    public FlightDetails findFlight(String flightName) {

        return flights.stream()
                .filter(flight -> flight.name().equals(flightName))
                .findFirst()
                .orElseThrow(() ->
                        new InvalidBookingException(
                                "Invalid flight selection"
                        )
                );
    }

    public List<FlightDetails> getAllFlights() {
        return flights;
    }
}
