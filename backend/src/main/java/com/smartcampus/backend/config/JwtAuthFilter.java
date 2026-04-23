package com.smartcampus.backend.config;

import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepo;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                String clerkId = jwtUtil.extractUserId(token);
                String email = jwtUtil.extractEmail(token);
                String name = jwtUtil.extractName(token);

                if (clerkId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    User user = userRepo.findByClerkUserId(clerkId)
                            .orElseGet(() -> {
                                User newUser = new User(
                                        clerkId,
                                        email != null ? email : "unknown@email.com",
                                        name != null ? name : "New User"
                                );
                                return userRepo.save(newUser);
                            });

                    boolean changed = false;

                    if ((user.getEmail() == null || user.getEmail().equals("unknown@email.com")) && email != null) {
                        user.setEmail(email);
                        changed = true;
                    }

                    if ((user.getName() == null || user.getName().equals("New User")) && name != null) {
                        user.setName(name);
                        changed = true;
                    }

                    if (user.getRoles() == null || user.getRoles().isEmpty()) {
                        user.setRoles(List.of("USER"));
                        changed = true;
                    }

                    if (changed) {
                        user = userRepo.save(user);
                    }

                    List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                            .map(role -> new SimpleGrantedAuthority(role.toUpperCase()))
                            .collect(Collectors.toList());

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(user, null, authorities);

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                System.err.println("Authentication filter error: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}