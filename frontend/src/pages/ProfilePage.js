import React from 'react';
import ProfileForm from '../components/profile/ProfileForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const ProfilePage = () => {
    return (
        <div className="profile-page">
            <div className="page-header">
                <h1>Mein Profil</h1>
            </div>

            <div className="profile-grid">
                <div className="profile-section">
                    <ProfileForm />
                </div>

                <div className="profile-section">
                    <ChangePasswordForm />
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;