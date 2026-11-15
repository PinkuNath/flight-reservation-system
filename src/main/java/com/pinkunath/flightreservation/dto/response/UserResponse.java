package com.pinkunath.flightreservation.dto.response;

public record UserResponse(
        Long id,
        String username,
        String fullName,
        String email,
        String phone
) {
}