package com.neurodose.security;

public record AuthenticatedUser(
        String uid,
        String email,
        String name
) {
}
