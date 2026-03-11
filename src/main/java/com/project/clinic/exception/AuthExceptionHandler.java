package com.project.clinic.exception;

public class AuthExceptionHandler extends RuntimeException {
    public AuthExceptionHandler(String message) {
        super(message);
    }
}
