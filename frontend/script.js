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

function forgotPassword() {

    alert(
        "Password reset feature will be added later."
    );
}


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