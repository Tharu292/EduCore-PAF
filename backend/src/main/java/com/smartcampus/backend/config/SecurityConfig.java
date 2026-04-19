package com.smartcampus.backend.config;

// ඔබගේ දැනට තිබූ import එක
import com.smartcampus.backend.config.JwtAuthFilter;

// අලුතින් එකතු වූ imports
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtFilter) throws Exception {
        return http
                // 1. CORS සැකසුම් සක්‍රිය කිරීම (අලුතින් එකතු කළ කොටස)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // 2. Browser එකෙන් එන Preflight (OPTIONS) requests වලට පූර්ණ අවසර ලබා දීම (අත්‍යවශ්‍යයි!)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    // 3. React Frontend එකට අවසර ලබා දෙන CORS Configuration Bean එක (අලුතින් එකතු කළ කොටස)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // React App එක run වෙන port එකට (5173) අවසර දීම
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));

        // අවශ්‍ය HTTP methods සියල්ලටම ඉඩ දීම
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Clerk Token (Authorization Header) එක සහ අනෙකුත් headers යැවීමට ඉඩ දීම
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // පද්ධතියේ ඇති සියලුම API Endpoints වලට මෙය අදාළ කිරීම
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}