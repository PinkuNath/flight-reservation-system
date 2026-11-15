
package com.pinkunath.flightreservation.dto.request;

import com.pinkunath.flightreservation.entity.SeatType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

public record BookingRequest(

        @NotBlank(message = "Source is required")
        String source,

        @NotBlank(message = "Destination is required")
        String destination,

        @NotNull(message = "Travel date is required")
        @FutureOrPresent(message = "Travel date cannot be in the past")
        LocalDate travelDate,

        @NotBlank(message = "Flight selection is required")
        String flightName,

        @NotEmpty(message = "At least one passenger is required")
        @Size(max = 9, message = "Maximum 9 passengers are allowed")
        List<@Valid PassengerRequest> passengers

) {

        public record PassengerRequest(

                @NotBlank(message = "Passenger name is required")
                @Size(max = 100, message = "Name cannot exceed 100 characters")
                String name,

                @NotNull(message = "Passenger age is required")
                @Min(value = 1, message = "Age must be at least 1")
                @Max(value = 120, message = "Age cannot exceed 120")
                Integer age,

                @NotBlank(message = "ID proof is required")
                @Size(max = 30, message = "ID proof cannot exceed 30 characters")
                String idProof,

                @NotNull(message = "Seat preference is required")
                SeatType seatType

        ) {
        }
}
