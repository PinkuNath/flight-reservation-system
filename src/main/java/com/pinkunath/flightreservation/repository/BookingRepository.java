
package com.pinkunath.flightreservation.repository;

import com.pinkunath.flightreservation.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findAllByUser_IdOrderByBookingTimeDesc(Long userId);

    Optional<Booking> findByIdAndUser_Id(Long bookingId, Long userId);

    boolean existsByPassengers_BoardingNumber(String boardingNumber);
}
