const API_URL = "http://localhost:5000";


/* =================================
   LOGIN
================================= */

const loginForm =
    document.getElementById("loginForm");


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document
                .getElementById("loginEmail")
                .value
                .trim();


        const password =
            document
                .getElementById("loginPassword")
                .value;


        if (!email || !password) {

            alert(
                "Please enter your email and password."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/api/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );


            const data =
                await response.json();


            /* LOGIN FAILED */

            if (!response.ok) {

                alert(
                    data.message ||
                    "Invalid email or password."
                );

                return;
            }


            /* SAVE TOKEN */

            localStorage.setItem(
                "token",
                data.token
            );


            /* SAVE USER */

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            alert(
                "Login successful! 🎉"
            );


            /* GO TO DASHBOARD */

            window.location.href =
                "dashboard.html";


        } catch (error) {

            console.error(error);

            alert(
                "Cannot connect to the server.\n\n" +
                "Please make sure the backend is running."
            );
        }

    }
);


/* =================================
   OPEN SIGNUP
================================= */

function showSignup() {

    const modal =
        document.getElementById(
            "signupModal"
        );


    modal.classList.add("active");


    document.body.style.overflow =
        "hidden";
}


/* =================================
   CLOSE SIGNUP
================================= */

function closeSignup() {

    const modal =
        document.getElementById(
            "signupModal"
        );


    modal.classList.remove("active");


    document.body.style.overflow =
        "auto";
}


/* =================================
   SIGNUP
================================= */

const signupForm =
    document.getElementById(
        "signupForm"
    );


signupForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const firstName =
            document
                .getElementById("firstName")
                .value
                .trim();


        const lastName =
            document
                .getElementById("lastName")
                .value
                .trim();


        const email =
            document
                .getElementById("signupEmail")
                .value
                .trim();


        const password =
            document
                .getElementById("signupPassword")
                .value;


        const confirmPassword =
            document
                .getElementById("confirmPassword")
                .value;


        /* CHECK EMPTY */

        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword
        ) {

            alert(
                "Please fill in all fields."
            );

            return;
        }


        /* PASSWORD LENGTH */

        if (password.length < 6) {

            alert(
                "Password must contain at least 6 characters."
            );

            return;
        }


        /* PASSWORD MATCH */

        if (password !== confirmPassword) {

            alert(
                "Passwords do not match."
            );

            return;
        }


        /*
         * Backend database uses:
         *
         * name
         * email
         * password
         *
         * So combine first name + last name.
         */

        const name =
            `${firstName} ${lastName}`;


        try {

            const response =
                await fetch(
                    `${API_URL}/api/register`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name: name,

                            email: email,

                            password: password

                        })
                    }
                );


            const data =
                await response.json();


            /* REGISTRATION FAILED */

            if (!response.ok) {

                alert(
                    data.message ||
                    "Registration failed."
                );

                return;
            }


            /* SUCCESS */

            alert(
                "Account created successfully! 🎉"
            );


            /* CLEAR FORM */

            signupForm.reset();


            /* CLOSE SIGNUP */

            closeSignup();


            /*
             * Automatically put the
             * registered email into login.
             */

            document
                .getElementById("loginEmail")
                .value = email;


        } catch (error) {

            console.error(error);

            alert(
                "Cannot connect to the server.\n\n" +
                "Please make sure the backend is running."
            );
        }

    }
);


/* =================================
   SHOW / HIDE PASSWORD
================================= */

function togglePassword(
    inputId,
    button
) {

    const input =
        document.getElementById(
            inputId
        );


    if (
        input.type === "password"
    ) {

        input.type = "text";

        button.textContent =
            "🙈";

    } else {

        input.type = "password";

        button.textContent =
            "👁";
    }
}

/* =================================
   FORGOT PASSWORD
================================= */

let resetToken = null;


/* =================================
   OPEN FORGOT PASSWORD
================================= */

function openForgotPassword() {

    const modal =
        document.getElementById(
            "forgotPasswordModal"
        );

    modal.classList.add("active");

    document.body.style.overflow =
        "hidden";

    /* Reset to Step 1 */

    document.getElementById(
        "forgotStep"
    ).style.display = "block";

    document.getElementById(
        "resetStep"
    ).style.display = "none";

    document.getElementById(
        "forgotPasswordForm"
    ).reset();

    document.getElementById(
        "resetPasswordForm"
    ).reset();

    resetToken = null;
}


/* =================================
   CLOSE FORGOT PASSWORD
================================= */

function closeForgotPassword() {

    const modal =
        document.getElementById(
            "forgotPasswordModal"
        );

    modal.classList.remove("active");

    document.body.style.overflow =
        "auto";

    resetToken = null;
}


/* =================================
   CHECK EMAIL
================================= */

const forgotPasswordForm =
    document.getElementById(
        "forgotPasswordForm"
    );


forgotPasswordForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const email =
            document
                .getElementById("forgotEmail")
                .value
                .trim();

        if (!email) {

            alert(
                "Please enter your email address."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/api/forgot-password`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: email
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Email not found."
                );

                return;
            }


            /*
             * Save reset token temporarily.
             */

            resetToken =
                data.resetToken;


            /*
             * Move to reset password step.
             */

            document.getElementById(
                "forgotStep"
            ).style.display = "none";

            document.getElementById(
                "resetStep"
            ).style.display = "block";


            alert(
                "Email verified successfully! 🔐"
            );

        } catch (error) {

            console.error(error);

            alert(
                "Cannot connect to the server.\n\n" +
                "Please make sure the backend is running."
            );

        }

    }
);


/* =================================
   RESET PASSWORD
================================= */

const resetPasswordForm =
    document.getElementById(
        "resetPasswordForm"
    );


resetPasswordForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const newPassword =
            document
                .getElementById("newPassword")
                .value;


        const confirmPassword =
            document
                .getElementById(
                    "resetConfirmPassword"
                )
                .value;


        /* CHECK PASSWORD LENGTH */

        if (newPassword.length < 6) {

            alert(
                "Password must contain at least 6 characters."
            );

            return;
        }


        /* CHECK PASSWORD MATCH */

        if (
            newPassword !==
            confirmPassword
        ) {

            alert(
                "Passwords do not match."
            );

            return;
        }


        /* CHECK TOKEN */

        if (!resetToken) {

            alert(
                "Reset session expired. Please try again."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/api/reset-password`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            resetToken:
                                resetToken,

                            newPassword:
                                newPassword

                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Password reset failed."
                );

                return;
            }


            /* SUCCESS */

            alert(
                "Password reset successfully! 🎉\n\n" +
                "You can now login with your new password."
            );


            /*
             * Close modal
             */

            closeForgotPassword();


            /*
             * Put email back into login.
             */

            const forgotEmail =
                document
                    .getElementById(
                        "forgotEmail"
                    )
                    .value;

            document
                .getElementById(
                    "loginEmail"
                )
                .value =
                forgotEmail;


            /*
             * Clear password fields
             */

            document
                .getElementById(
                    "loginPassword"
                )
                .value = "";


        } catch (error) {

            console.error(error);

            alert(
                "Cannot connect to the server.\n\n" +
                "Please make sure the backend is running."
            );

        }

    }
);


/* =================================
   CLOSE MODAL OUTSIDE
================================= */

const signupModal =
    document.getElementById(
        "signupModal"
    );


signupModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === signupModal
        ) {

            closeSignup();
        }

    }
);


/* =================================
   THEME TOGGLE
================================= */

function applyTheme(theme) {

    const isDark = theme === "dark";

    document.body.classList.toggle(
        "dark-theme",
        isDark
    );

    const toggleButton =
        document.getElementById("themeToggle");

    if (toggleButton) {
        toggleButton.querySelector(
            ".theme-toggle-icon"
        ).textContent =
            isDark ? "☀️" : "🌙";

        toggleButton.setAttribute(
            "aria-label",
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );
    }
}

function initializeTheme() {

    const savedTheme =
        localStorage.getItem("theme") ||
        "light";

    applyTheme(savedTheme);

    const toggleButton =
        document.getElementById("themeToggle");

    if (toggleButton) {
        toggleButton.addEventListener(
            "click",
            function () {

                const nextTheme =
                    document.body.classList.contains(
                        "dark-theme"
                    ) ? "light" : "dark";

                localStorage.setItem(
                    "theme",
                    nextTheme
                );

                applyTheme(nextTheme);
            }
        );
    }
}

initializeTheme();

/* =================================
   ESC KEY
================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeSignup();
        }

    }
);