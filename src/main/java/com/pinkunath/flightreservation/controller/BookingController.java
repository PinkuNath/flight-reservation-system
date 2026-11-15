package com.pinkunath.flightreservation.controller;

import com.pinkunath.flightreservation.dto.request.BookingRequest;
import com.pinkunath.flightreservation.dto.response.BookingResponse;
import com.pinkunath.flightreservation.service.BookingService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@AllArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication) {

        BookingResponse response = bookingService.createBooking(
                authentication.getName(), request
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getUserBookings(
            Authentication authentication) {

        List<BookingResponse> bookings =
                bookingService.getUserBookings(authentication.getName());

        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id,
            Authentication authentication) {

        BookingResponse booking = bookingService.getBookingById(
                id, authentication.getName()
        );

        return ResponseEntity.ok(booking);
    }
}