package ch.fhnw.timerecordingbackend.dto;

public class LoginResponse {
    private String token;
    private UserDto user;

    public LoginResponse(String token, UserDto user) {
        this.token = token;
        this.user = user;
    }

    // Getters and setters
    public String getToken() {
        return token;
    }

    public UserDto getUser() {
        return user;
    }

    public static class UserDto {
        private Long id;
        private String name;
        private String role;

        public UserDto(Long id, String name, String role) {
            this.id = id;
            this.name = name;
            this.role = role;
        }

        // Getters
        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public String getRole() {
            return role;
        }
    }
}
