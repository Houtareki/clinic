package com.project.clinic.controller;

import com.project.clinic.dto.ChangePasswordDTO;
import com.project.clinic.dto.ProfileResponseDTO;
import com.project.clinic.entity.Account;
import com.project.clinic.entity.Doctor;
import com.project.clinic.mapper.DoctorMapper;
import com.project.clinic.mapper.EmployeeMapper;
import com.project.clinic.service.AccountService;
import com.project.clinic.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private static final String AVATAR_UPLOAD_URL_PREFIX = "/uploads/avatars";
    private static final long MAX_AVATAR_SIZE_BYTES = 2L * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    private final AccountService accountService;
    private final DoctorService doctorService;
    private final Path avatarStorageDirectory;

    @Autowired
    public ProfileController(
            AccountService accountService,
            DoctorService doctorService,
            @Value("${app.upload.avatar-dir:uploads/avatars}") String avatarUploadDir
    ) {
        this.accountService = accountService;
        this.doctorService = doctorService;
        this.avatarStorageDirectory = Paths.get(avatarUploadDir).toAbsolutePath().normalize();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(@RequestHeader("X-User-Id") int userId) {
        Account account = accountService.findById(userId);
        if (account == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Khong tim thay nguoi dung");
        }

        if (account.getRole() == Account.Role.DOCTOR) {
            Doctor doctor = doctorService.findByAccountId(userId).orElse(null);
            return ResponseEntity.ok(DoctorMapper.toDoctorResponse(account, doctor));
        }

        return ResponseEntity.ok(EmployeeMapper.toEmployeeList(Collections.singletonList(account)).getFirst());
    }

    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<?> updateProfile(
            @RequestHeader("X-User-Id") int userId,
            @RequestBody ProfileResponseDTO request
    ) {
        Account account = accountService.findById(userId);
        if (account == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Khong tim thay nguoi dung");
        }

        if (request.getFullName() != null) {
            account.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            account.setPhone(request.getPhone());
        }
        if (request.getEmail() != null) {
            account.setEmail(request.getEmail());
        }
        if (request.getAvatarUrl() != null) {
            account.setAvatarUrl(request.getAvatarUrl());
        }

        accountService.save(account);

        if (account.getRole() == Account.Role.DOCTOR) {
            Doctor doctor = doctorService.findByAccountId(userId).orElse(new Doctor());

            doctor.setAccount(account);

            if (request.getSpecialty() != null) {
                doctor.setSpecialty(request.getSpecialty());
            }
            if (request.getDegree() != null) {
                doctor.setDegree(request.getDegree());
            }
            if (request.getBio() != null) {
                doctor.setBio(request.getBio());
            }

            doctorService.save(doctor);
            return ResponseEntity.ok(DoctorMapper.toDoctorResponse(account, doctor));
        }

        return ResponseEntity.ok(EmployeeMapper.toEmployeeList(Collections.singletonList(account)).getFirst());
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("X-User-Id") int userId,
            @RequestBody ChangePasswordDTO request
    ) {
        Account account = accountService.findById(userId);
        if (account == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Khong tim thay nguoi dung");
        }

        if (!account.getPassword().equals(request.getCurrentPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mat khau hien tai khong chinh xac!");
        }

        account.setPassword(request.getNewPassword());
        accountService.save(account);

        return ResponseEntity.ok("Doi mat khau thanh cong!");
    }

    @PostMapping("/upload-avatar")
    public ResponseEntity<?> uploadAvatar(
            @RequestHeader("X-User-Id") int userId,
            @RequestParam("file") MultipartFile file
    ) {
        Account account = accountService.findById(userId);
        if (account == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Khong tim thay nguoi dung");
        }

        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Vui long chon file anh!");
        }

        if (!isSupportedImageType(file)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Chi chap nhan JPG, PNG, GIF hoac WEBP!");
        }

        if (file.getSize() > MAX_AVATAR_SIZE_BYTES) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Kich thuoc anh toi da la 2MB!");
        }

        String previousAvatarUrl = account.getAvatarUrl();
        String storedFileName = null;

        try {
            Files.createDirectories(avatarStorageDirectory);
            storedFileName = storeAvatar(file);
            String avatarUrl = buildAvatarUrl(storedFileName);

            account.setAvatarUrl(avatarUrl);
            accountService.save(account);
            deleteStoredAvatarIfManaged(previousAvatarUrl);

            Map<String, String> response = new LinkedHashMap<>();
            response.put("avatarUrl", avatarUrl);
            return ResponseEntity.ok(response);
        } catch (Exception exception) {
            deleteStoredAvatarByFileName(storedFileName);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Khong the luu anh dai dien luc nay!");
        }
    }

    private boolean isSupportedImageType(MultipartFile file) {
        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType)) {
            return false;
        }

        return ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT));
    }

    private String storeAvatar(MultipartFile file) throws IOException {
        String extension = resolveFileExtension(file);
        String storedFileName = UUID.randomUUID() + "." + extension;
        Path targetFile = avatarStorageDirectory.resolve(storedFileName).normalize();

        if (!targetFile.startsWith(avatarStorageDirectory)) {
            throw new IOException("Invalid avatar storage path");
        }

        Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
        return storedFileName;
    }

    private String resolveFileExtension(MultipartFile file) {
        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        if (StringUtils.hasText(extension)) {
            return extension.toLowerCase(Locale.ROOT);
        }

        String contentType = file.getContentType();
        if ("image/png".equalsIgnoreCase(contentType)) {
            return "png";
        }
        if ("image/gif".equalsIgnoreCase(contentType)) {
            return "gif";
        }
        if ("image/webp".equalsIgnoreCase(contentType)) {
            return "webp";
        }

        return "jpg";
    }

    private String buildAvatarUrl(String storedFileName) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(AVATAR_UPLOAD_URL_PREFIX)
                .path("/")
                .path(storedFileName)
                .toUriString();
    }

    private void deleteStoredAvatarIfManaged(String avatarUrl) {
        resolveStoredAvatarPath(avatarUrl).ifPresent(path -> {
            try {
                Files.deleteIfExists(path);
            } catch (IOException ignored) {
            }
        });
    }

    private void deleteStoredAvatarByFileName(String storedFileName) {
        if (!StringUtils.hasText(storedFileName)) {
            return;
        }

        Path storedFilePath = avatarStorageDirectory.resolve(storedFileName).normalize();
        if (!storedFilePath.startsWith(avatarStorageDirectory)) {
            return;
        }

        try {
            Files.deleteIfExists(storedFilePath);
        } catch (IOException ignored) {
        }
    }

    private Optional<Path> resolveStoredAvatarPath(String avatarUrl) {
        if (!StringUtils.hasText(avatarUrl)) {
            return Optional.empty();
        }

        try {
            URI avatarUri = URI.create(avatarUrl);
            String avatarPath = avatarUri.getPath();
            if (!StringUtils.hasText(avatarPath) || !avatarPath.startsWith(AVATAR_UPLOAD_URL_PREFIX + "/")) {
                return Optional.empty();
            }

            String fileName = Paths.get(avatarPath).getFileName().toString();
            if (!StringUtils.hasText(fileName)) {
                return Optional.empty();
            }

            Path resolvedPath = avatarStorageDirectory.resolve(fileName).normalize();
            if (!resolvedPath.startsWith(avatarStorageDirectory)) {
                return Optional.empty();
            }

            return Optional.of(resolvedPath);
        } catch (Exception exception) {
            return Optional.empty();
        }
    }
}
