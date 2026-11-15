package com.pinkunath.flightreservation.controller;

import com.pinkunath.flightreservation.service.FlightCatalog;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flights")
@AllArgsConstructor
public class FlightController {

    private final FlightCatalog flightCatalog;

    @GetMapping
    public ResponseEntity<List<FlightCatalog.FlightDetails>> getAllFlights() {
        return ResponseEntity.ok(flightCatalog.getAllFlights());
    }
}