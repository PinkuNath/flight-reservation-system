
package com.pinkunath.flightreservation.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserRegistrationRequest(

        @NotBlank(message = "Username is required")
        @Size(min = 4, max = 20,
                message = "Username must be between 4 and 20 characters")
        @Pattern(
                regexp = "^[a-zA-Z][a-zA-Z0-9_]*$",
                message = "Username must start with a letter and contain only letters, numbers or underscores"
        )
        String username,

        @NotBlank(message = "Full name is required")
        @Size(max = 100, message = "Name cannot have more than 100 characters")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email")
        @Size(max = 150, message = "Email cannot exceed 150 characters")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 72,
                message = "Password must be between 8 and 72 characters")
        String password,

        @Size(max = 15, message = "Phone number cannot have more than 15 characters")
        String phone
) {
}
