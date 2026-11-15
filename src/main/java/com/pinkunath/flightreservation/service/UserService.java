
package com.pinkunath.flightreservation.service;

import com.pinkunath.flightreservation.entity.Role;
import com.pinkunath.flightreservation.entity.User;
import com.pinkunath.flightreservation.exception.InvalidCredentialsException;
import com.pinkunath.flightreservation.exception.UsernameAlreadyTakenException;
import com.pinkunath.flightreservation.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@AllArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public User registerUser(
            String username,
            String fullName,
            String email,
            String password,
            String phone
    ) {
        username = username.trim();
        email = email.trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByUsername(username)) {
            throw new UsernameAlreadyTakenException(
                    "Username is already taken"
            );
        }

        String encodedPassword = passwordEncoder.encode(password);

        User user = new User(
                username,
                fullName,
                email,
                encodedPassword,
                phone,
                Role.USER
        );

        return userRepository.save(user);
    }

    public Authentication authenticateUser(
            String username,
            String password
    ) {
        try {
            return authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            username,
                            password
                    )
            );

        } catch (BadCredentialsException ex) {
            throw new InvalidCredentialsException(
                    "Invalid username or password"
            );
        }
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new InvalidCredentialsException(
                                "Invalid username or password"
                        )
                );
    }
}
