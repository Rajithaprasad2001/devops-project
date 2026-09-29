const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "lost_found_secret_2026";

const app = express();


// =========================================
// MIDDLEWARE
// =========================================

app.use(cors());
app.use(express.json());


// =========================================
// TEST ROUTE
// =========================================

app.get("/", (req, res) => {
    res.send("Lost and Found Backend is Running!");
});


// =========================================
// REGISTER USER
// =========================================

app.post("/api/register", async (req, res) => {

    const {
        name,
        email,
        password
    } = req.body;


    if (!name || !email || !password) {

        return res.status(400).json({
            message: "Name, email and password are required."
        });

    }


    if (password.length < 6) {

        return res.status(400).json({
            message: "Password must contain at least 6 characters."
        });

    }


    try {

        // Check existing email
        const checkSql =
            "SELECT id FROM users WHERE email = ?";

        db.query(
            checkSql,
            [email],
            async (checkError, results) => {

                if (checkError) {

                    console.error(checkError);

                    return res.status(500).json({
                        message: "Server error."
                    });

                }


                if (results.length > 0) {

                    return res.status(409).json({
                        message:
                            "An account with this email already exists."
                    });

                }


                // Hash password
                const hashedPassword =
                    await bcrypt.hash(password, 10);


                const sql = `
                    INSERT INTO users
                    (name, email, password)
                    VALUES (?, ?, ?)
                `;


                db.query(
                    sql,
                    [
                        name,
                        email,
                        hashedPassword
                    ],
                    (err, result) => {

                        if (err) {

                            console.error(err);

                            return res.status(500).json({
                                message:
                                    "Registration failed."
                            });

                        }


                        res.status(201).json({

                            message:
                                "User registered successfully.",

                            user: {
                                id: result.insertId,
                                name: name,
                                email: email
                            }

                        });

                    }
                );

            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error."
        });

    }

});


// =========================================
// LOGIN USER
// =========================================

app.post("/api/login", (req, res) => {

    const {
        email,
        password
    } = req.body;


    if (!email || !password) {

        return res.status(400).json({
            message: "Email and password are required."
        });

    }


    const sql =
        "SELECT * FROM users WHERE email = ?";


    db.query(
        sql,
        [email],
        async (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message: "Server error."
                });

            }


            if (results.length === 0) {

                return res.status(401).json({
                    message:
                        "Invalid email or password."
                });

            }


            const user = results[0];


            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!passwordMatch) {

                return res.status(401).json({
                    message:
                        "Invalid email or password."
                });

            }


            // Create JWT
            const token = jwt.sign(

                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },

                JWT_SECRET,

                {
                    expiresIn: "1h"
                }

            );


            res.json({

                message: "Login successful",

                token: token,

                user: {

                    id: user.id,

                    name: user.name,

                    email: user.email,

                    role: user.role

                }

            });

        }
    );

});


// =========================================
// FORGOT PASSWORD
// =========================================

app.post("/api/forgot-password", (req, res) => {

    const {
        email
    } = req.body;


    if (!email) {

        return res.status(400).json({
            message: "Email is required."
        });

    }


    const sql = `
        SELECT id, name, email
        FROM users
        WHERE email = ?
    `;


    db.query(
        sql,
        [email],
        (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message: "Server error."
                });

            }


            if (results.length === 0) {

                return res.status(404).json({
                    message:
                        "No account found with this email."
                });

            }


            const user = results[0];


            // Temporary reset token
            const resetToken = jwt.sign(

                {
                    id: user.id,
                    email: user.email,
                    type: "password_reset"
                },

                JWT_SECRET,

                {
                    expiresIn: "15m"
                }

            );


            /*
             * DEVELOPMENT VERSION
             *
             * For now we return the reset token.
             * Later we can connect Gmail/SMTP
             * and send this token through email.
             */

            res.json({

                message:
                    "Email verified successfully.",

                resetToken: resetToken,

                user: {

                    id: user.id,

                    name: user.name,

                    email: user.email

                }

            });

        }
    );

});


// =========================================
// RESET PASSWORD
// =========================================

app.post("/api/reset-password", async (req, res) => {

    const {
        resetToken,
        newPassword
    } = req.body;


    if (!resetToken || !newPassword) {

        return res.status(400).json({

            message:
                "Reset token and new password are required."

        });

    }


    if (newPassword.length < 6) {

        return res.status(400).json({

            message:
                "Password must contain at least 6 characters."

        });

    }


    try {

        // Verify token
        const decoded =
            jwt.verify(
                resetToken,
                JWT_SECRET
            );


        // Make sure token is password reset token
        if (
            decoded.type !==
            "password_reset"
        ) {

            return res.status(403).json({

                message:
                    "Invalid reset token."

            });

        }


        // Hash new password
        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );


        const sql = `
            UPDATE users
            SET password = ?
            WHERE id = ?
        `;


        db.query(

            sql,

            [
                hashedPassword,
                decoded.id
            ],

            (err, result) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({

                        message:
                            "Failed to reset password."

                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        message:
                            "User not found."

                    });

                }


                res.json({

                    message:
                        "Password reset successfully."

                });

            }

        );

    } catch (error) {

        console.error(error);

        return res.status(403).json({

            message:
                "Reset link is invalid or expired. Please try again."

        });

    }

});


// =========================================
// VERIFY JWT TOKEN
// =========================================

function verifyToken(req, res, next) {

    const authHeader =
        req.headers["authorization"];


    if (!authHeader) {

        return res.status(401).json({

            message:
                "Access denied. Token required."

        });

    }


    const token =
        authHeader.split(" ")[1];


    if (!token) {

        return res.status(401).json({

            message:
                "Invalid authorization format."

        });

    }


    try {

        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );


        req.user = decoded;

        next();

    } catch (error) {

        return res.status(403).json({

            message:
                "Invalid or expired token."

        });

    }

}


// =========================================
// PROFILE
// =========================================

app.get(
    "/api/profile",
    verifyToken,
    (req, res) => {

        res.json({

            message:
                "You can access this protected route.",

            user: req.user

        });

    }
);


// =========================================
// DASHBOARD DATA
// =========================================

app.get(
    "/api/dashboard",
    verifyToken,
    (req, res) => {

        const userId =
            req.user.id;


        // -------------------------------
        // Statistics
        // -------------------------------

        const statsQuery = `

            SELECT

                SUM(
                    status = 'lost'
                ) AS lostItems,

                SUM(
                    status = 'found'
                ) AS foundItems,

                SUM(
                    status = 'returned'
                ) AS returnedItems

            FROM items

        `;


        // -------------------------------
        // Current user's reports
        // -------------------------------

        const myReportsQuery = `

            SELECT
                COUNT(*) AS myReports

            FROM items

            WHERE user_id = ?

        `;


        // -------------------------------
        // Recent items
        // -------------------------------

        const recentItemsQuery = `

            SELECT

                id,
                title,
                description,
                location,
                status,
                icon,
                created_at

            FROM items

            ORDER BY created_at DESC

            LIMIT 4

        `;


        // Get statistics
        db.query(
            statsQuery,
            (statsError, statsResult) => {

                if (statsError) {

                    console.error(
                        "Dashboard stats error:",
                        statsError
                    );

                    return res.status(500).json({

                        message:
                            "Failed to load dashboard statistics."

                    });

                }


                // Get user's reports
                db.query(

                    myReportsQuery,

                    [userId],

                    (reportsError, reportsResult) => {

                        if (reportsError) {

                            console.error(
                                "Reports error:",
                                reportsError
                            );

                            return res.status(500).json({

                                message:
                                    "Failed to load reports."

                            });

                        }


                        // Get recent items
                        db.query(

                            recentItemsQuery,

                            (itemsError, itemsResult) => {

                                if (itemsError) {

                                    console.error(
                                        "Recent items error:",
                                        itemsError
                                    );

                                    return res.status(500).json({

                                        message:
                                            "Failed to load recent items."

                                    });

                                }


                                const stats =
                                    statsResult[0] || {};


                                res.json({

                                    stats: {

                                        lostItems:
                                            Number(
                                                stats.lostItems
                                            ) || 0,

                                        foundItems:
                                            Number(
                                                stats.foundItems
                                            ) || 0,

                                        returnedItems:
                                            Number(
                                                stats.returnedItems
                                            ) || 0,

                                        myReports:
                                            Number(
                                                reportsResult[0]
                                                    ?.myReports
                                            ) || 0

                                    },


                                    recentItems:
                                        itemsResult

                                });

                            }

                        );

                    }

                );

            }

        );

    }

);


// =========================================
// CREATE LOST / FOUND ITEM
// =========================================

app.post(
    "/api/items",
    verifyToken,
    (req, res) => {

        const {
            title,
            description,
            location,
            status,
            icon
        } = req.body;


        // Validation
        if (
            !title ||
            !location ||
            !status
        ) {

            return res.status(400).json({

                message:
                    "Title, location and status are required."

            });

        }


        if (
            ![
                "lost",
                "found",
                "returned"
            ].includes(status)
        ) {

            return res.status(400).json({

                message:
                    "Invalid item status."

            });

        }


        const userId =
            req.user.id;


        const sql = `

            INSERT INTO items

            (
                user_id,
                title,
                description,
                location,
                status,
                icon
            )

            VALUES (?, ?, ?, ?, ?, ?)

        `;


        db.query(

            sql,

            [

                userId,

                title,

                description || "",

                location,

                status,

                icon || "📦"

            ],

            (err, result) => {

                if (err) {

                    console.error(
                        "Create item error:",
                        err
                    );

                    return res.status(500).json({

                        message:
                            "Failed to create item."

                    });

                }


                res.status(201).json({

                    message:
                        "Item reported successfully.",

                    itemId:
                        result.insertId

                });

            }

        );

    }

);


// =========================================
// GET ALL ITEMS
// =========================================

app.get(
    "/api/items",
    verifyToken,
    (req, res) => {

        const {
            status
        } = req.query;


        let sql = `

            SELECT

                items.id,
                items.title,
                items.description,
                items.location,
                items.status,
                items.icon,
                items.created_at,
                users.name AS user_name

            FROM items

            INNER JOIN users
            ON items.user_id = users.id

        `;


        const params = [];


        if (status) {

            sql += `
                WHERE items.status = ?
            `;

            params.push(status);

        }


        sql += `

            ORDER BY
                items.created_at DESC

        `;


        db.query(
            sql,
            params,
            (err, results) => {

                if (err) {

                    console.error(
                        "Get items error:",
                        err
                    );

                    return res.status(500).json({

                        message:
                            "Failed to load items."

                    });

                }


                res.json({

                    items: results

                });

            }

        );

    }

);


// =========================================
// SERVER START
// =========================================

const PORT = 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

        console.log(
            "Lost & Found backend is ready."
        );

    }
);