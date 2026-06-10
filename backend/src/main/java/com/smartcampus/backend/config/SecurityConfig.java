package com.smartcampus.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                          CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()

                        // Disable old custom login system
                        .requestMatchers("/api/auth/**").denyAll()

                        // User/admin APIs
                        .requestMatchers("/api/users/me").authenticated()
                        .requestMatchers("/api/users/by-clerk/**").authenticated()
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")

                        // Notifications
                        .requestMatchers("/api/notifications/**").authenticated()

                        // Tickets
                        .requestMatchers("/api/tickets/**").authenticated()

                        // Resources
                        .requestMatchers(HttpMethod.GET, "/api/resources/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/resources/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/resources/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/resources/**").hasAuthority("ADMIN")

                        // Reviews
                        .requestMatchers("/api/reviews/**").authenticated()

                        // Bookings
                        .requestMatchers(HttpMethod.GET, "/api/bookings").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/bookings/me").hasAuthority("USER")
                        .requestMatchers(HttpMethod.GET, "/api/bookings/resource/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/bookings/**").hasAuthority("USER")
                        .requestMatchers(HttpMethod.PUT, "/api/bookings/*/approve").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/bookings/*/reject").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/bookings/*/cancel").hasAuthority("USER")
                        .requestMatchers(HttpMethod.PUT, "/api/bookings/*/reschedule").hasAuthority("USER")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}