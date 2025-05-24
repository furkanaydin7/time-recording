package ch.fhnw.timerecordingbackend.dto.authentication;

/**
 * Antwortobjekt für den Login-Vorgang mit Token und Benutzerinfos.
 * Enthält eine innere UserDto-Klasse mit ID, Name und Rolle.
 * @author FA
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 */
public class LoginResponse {

    // Das vom Server generierte JWT-Token
    private String token;
    // Benutzerinformationen
    private UserDto user;

    public LoginResponse(String token, UserDto user) {
        this.token = token;
        this.user = user;
    }

    // Getter und Setter
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    /**
     * Innere statische Klasse zur Darstellung eines Benutzers in der Login-Antwort
     * Wird verwendet, um Benutzerinformationen wie ID, Name und Rolle sicher und strukturiert zurückzugeben
     */
    public static class UserDto {
        private Long id;
        private String name;
        private String role;

        public UserDto(Long id, String name, String role) {
            this.id = id;
            this.name = name;
            this.role = role;
        }

        // Getter und Setter
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }
}
