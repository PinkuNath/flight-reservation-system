
package com.pinkunath.flightreservation.service;

import com.pinkunath.flightreservation.dto.request.BookingRequest;
import com.pinkunath.flightreservation.dto.response.BookingResponse;
import com.pinkunath.flightreservation.entity.Booking;
import com.pinkunath.flightreservation.entity.Passenger;
import com.pinkunath.flightreservation.entity.SeatType;
import com.pinkunath.flightreservation.entity.User;
import com.pinkunath.flightreservation.exception.InvalidBookingException;
import com.pinkunath.flightreservation.repository.BookingRepository;
import com.pinkunath.flightreservation.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;

@Service
@AllArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final FlightCatalog flightCatalog;

    private static final BigDecimal WINDOW_SURCHARGE =
            new BigDecimal("300.00");

    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public BookingResponse createBooking(
            String username,
            BookingRequest request
    ) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new InvalidBookingException("User account not found")
                );

        if (request.source().equalsIgnoreCase(request.destination())) {
            throw new InvalidBookingException(
                    "Source and destination cannot be the same"
            );
        }

        FlightCatalog.FlightDetails flight =
                flightCatalog.findFlight(request.flightName());

        BigDecimal baseFare = flight.price();

        BigDecimal totalAmount = baseFare.multiply(
                BigDecimal.valueOf(request.passengers().size())
        );

        Booking booking = new Booking();

        booking.setUser(user);
        booking.setSource(request.source().trim());
        booking.setDestination(request.destination().trim());
        booking.setFlightName(flight.name());
        booking.setFlightTime(flight.time());
        booking.setTravelDate(request.travelDate());
        booking.setBaseFare(baseFare);

        for (BookingRequest.PassengerRequest passengerRequest
                : request.passengers()) {

            SeatType seatType = passengerRequest.seatType();

            // Add surcharge only for passengers choosing a window seat.
            if (seatType == SeatType.WINDOW) {
                totalAmount = totalAmount.add(WINDOW_SURCHARGE);
            }

            Passenger passenger = new Passenger(
                    booking,
                    passengerRequest.name().trim(),
                    passengerRequest.age(),
                    passengerRequest.idProof().trim(),
                    seatType,
                    generateBoardingNumber()
            );

            booking.getPassengers().add(passenger);
        }

        booking.setTotalAmount(totalAmount);

        Booking savedBooking = bookingRepository.save(booking);

        return mapToResponse(savedBooking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new InvalidBookingException("User account not found")
                );

        return bookingRepository
                .findAllByUser_IdOrderByBookingTimeDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(
            Long bookingId,
            String username
    ) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new InvalidBookingException("User account not found")
                );

        Booking booking = bookingRepository
                .findByIdAndUser_Id(bookingId, user.getId())
                .orElseThrow(() ->
                        new InvalidBookingException("Booking not found")
                );

        return mapToResponse(booking);
    }

    private String generateBoardingNumber() {

        String number;

        do {
            number = String.valueOf(
                    60000000 + RANDOM.nextInt(10000000)
            );

        } while (bookingRepository.existsByPassengers_BoardingNumber(number));

        return number;
    }

    private BookingResponse mapToResponse(Booking booking) {

        List<BookingResponse.PassengerResponse> passengers =
                booking.getPassengers()
                        .stream()
                        .map(passenger ->
                                new BookingResponse.PassengerResponse(
                                        passenger.getId(),
                                        passenger.getName(),
                                        passenger.getAge(),
                                        passenger.getSeatType(),
                                        passenger.getBoardingNumber()
                                )
                        )
                        .toList();

        return new BookingResponse(
                booking.getId(),
                booking.getSource(),
                booking.getDestination(),
                booking.getFlightName(),
                booking.getFlightTime(),
                booking.getTravelDate(),
                booking.getBaseFare(),
                booking.getTotalAmount(),
                booking.getBookingTime(),
                passengers
        );
    }
}
