package com.pinkunath.flightreservation.dto.response;

import java.util.Map;

public record ApiError(
       String message,
       Map<String, String> errors
) {
}
