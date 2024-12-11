document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profileForm');
    const userId = localStorage.getItem('userId');

    loadUserProfile();

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            user_id: userId,
            fullname: document.getElementById('usernameInput').value,
            email: document.getElementById('emailInput').value,
            theme: document.getElementById('themeSelect').value,
            timezone: document.getElementById('timezoneSelect').value,
            email_notifications: document.getElementById('emailNotifications').checked,
            web_notifications: document.getElementById('webNotifications').checked
        };

        try {
            const response = await fetch('/api/profile.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Profile updated successfully!');
                loadUserProfile(); // Reload the profile data
            } else {
                alert(data.message || 'Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            alert('Failed to update profile. Please check your connection and try again.');
        }
    });

    async function loadUserProfile() {
        try {
            const response = await fetch(`http://localhost:3000/api/get_profile.php?user_id=${userId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (data) {
                document.getElementById('usernameInput').value = data.fullname;
                document.getElementById('emailInput').value = data.email;
                document.getElementById('themeSelect').value = data.theme || 'light';
                document.getElementById('timezoneSelect').value = data.timezone || 'UTC';
                document.getElementById('emailNotifications').checked = data.email_notifications;
                document.getElementById('webNotifications').checked = data.web_notifications;

                // Update profile image if available
                if (data.profile_image) {
                    document.getElementById('profileImage').src = data.profile_image;
                    localStorage.setItem('profileImage', data.profile_image); // Store in local storage
                }

                // Update displayed username and email
                const usernameElement = document.getElementById('username');
                const emailElement = document.getElementById('email');

                if (usernameElement) {
                    usernameElement.textContent = data.fullname;
                }

                if (emailElement) {
                    emailElement.textContent = data.email;
                }
            } else {
                console.error('Failed to load profile data:', data.message);
                alert('Failed to load profile data. Please try again.');
            }
        } catch (error) {
            console.error('Profile load error:', error);
            alert('Failed to load profile data. Please check your connection and try again.');
        }
    }

    // Handle profile image upload
    const imageUploadButton = document.querySelector('.upload-image');
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';

    imageUploadButton.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profile_image', file);
            formData.append('user_id', userId);

            try {
                const response = await fetch('/api/profile.php', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (response.ok) {
                    document.getElementById('profileImage').src = data.image_url;
                    localStorage.setItem('profileImage', data.image_url); // Store in local storage
                    alert('Profile image updated successfully!');
                } else {
                    alert(data.message || 'Failed to upload profile image. Please try again.');
                }
            } catch (error) {
                console.error('Profile image upload error:', error);
                alert('Failed to upload profile image. Please check your connection and try again.');
            }
        }
    });

    // Populate timezone options
    const timezoneSelect = document.getElementById('timezoneSelect');
    const timezones = moment.tz.names();
    timezones.forEach(timezone => {
        const option = document.createElement('option');
        option.value = timezone;
        option.textContent = timezone;
        timezoneSelect.appendChild(option);
    });
});
