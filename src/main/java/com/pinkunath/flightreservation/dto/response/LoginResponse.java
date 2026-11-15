package com.pinkunath.flightreservation.dto.response;

public record LoginResponse(
        Long id,
        String username,
        String fullName,
        String email,
        String phone,
        String role
) {
}
