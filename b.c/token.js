// JWT library import kiya verify karne ke liye
import jwt from "jsonwebtoken";

// Middleware function: route ke andar user login hai ya nahi yeh check karega
const isAuthenticated = async (req, res, next) => {
    try {
        // 1. Request ke cookies se token uthate hain
        const token = req.cookies.token;

        // 2. Agar token nahi mila to unauthorized response bhejte hain
        if (!token) {
            return res.status(401).json({
                message: 'User not authenticated', // user login nahi hai
                success: false
            });
        }

        // 3. Token mil gaya, to ab use verify karte hain (SECRET_KEY env file me hona chahiye)
        const decode = await jwt.verify(token, process.env.SECRET_KEY);

        // 4. Agar token galat hai (ya verify nahi ho raha), error bhej do
        if (!decode) {
            return res.status(401).json({
                message: 'Invalid token', // galat token ya expired
                success: false
            });
        }

        // 5. Token sahi hai, to decode se userId nikal kar request me daal do
        req.id = decode.userId;

        // 6. Next middleware/route handler ko call karo
        next();
    } catch (error) {
        // 7. Agar koi unexpected error aa gaya to console me log karo
        console.log(error);

        // 8. Aur server error bhej do client ko
        return res.status(500).json({
            message: "Server error while authenticating",
            success: false
        });
    }
}

// Middleware export kar diya so that use kiya ja sake routes me
export default isAuthenticated;
