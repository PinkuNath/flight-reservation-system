
package com.pinkunath.flightreservation.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "passengers")
@Getter
@Setter
@NoArgsConstructor
public class Passenger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "full_name", nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Integer age;

    @Column(name = "id_proof", nullable = false, length = 30)
    private String idProof;

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_type", nullable = false, length = 20)
    private SeatType seatType;

    @Column(name = "boarding_number", nullable = false, unique = true, length = 8)
    private String boardingNumber;

    public Passenger(
            Booking booking,
            String name,
            Integer age,
            String idProof,
            SeatType seatType,
            String boardingNumber
    ) {
        this.booking = booking;
        this.name = name;
        this.age = age;
        this.idProof = idProof;
        this.seatType = seatType;
        this.boardingNumber = boardingNumber;
    }
}
