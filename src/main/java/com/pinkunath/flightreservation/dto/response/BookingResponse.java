
package com.pinkunath.flightreservation.dto.response;

import com.pinkunath.flightreservation.entity.SeatType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record BookingResponse(

        Long id,
        String source,
        String destination,
        String flightName,
        String flightTime,
        LocalDate travelDate,
        BigDecimal baseFare,
        BigDecimal totalAmount,
        LocalDateTime bookingTime,
        List<PassengerResponse> passengers

) {

    public record PassengerResponse(
            Long id,
            String name,
            Integer age,
            SeatType seatType,
            String boardingNumber
    ) {
    }
}
