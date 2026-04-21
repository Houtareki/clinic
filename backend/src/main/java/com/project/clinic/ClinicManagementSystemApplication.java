package com.project.clinic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@SpringBootApplication
public class ClinicManagementSystemApplication {

    @Value("${app.upload.avatar-dir:uploads/avatars}")
    private String avatarUploadDir;

    public static void main(String[] args) {
        SpringApplication.run(ClinicManagementSystemApplication.class, args);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        String avatarResourceLocation = Paths.get(avatarUploadDir)
                .toAbsolutePath()
                .normalize()
                .toUri()
                .toString();

        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5173")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }

            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/uploads/avatars/**")
                        .addResourceLocations(
                                avatarResourceLocation.endsWith("/")
                                        ? avatarResourceLocation
                                        : avatarResourceLocation + "/"
                        );
            }
        };
    }
}
