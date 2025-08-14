import httpStatus from 'http-status-codes';
import { User } from '../models/user.model.js';
import crypto from 'crypto';
import { Meeting } from '../models/meeting.model.js';

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user by username
        const user = await User.findOne({ username: username.toLowerCase().trim() });
        
        // Check if user exists and password is correct
        if (!user || !(await user.checkPassword(password))) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Generate and save token
        const token = crypto.randomBytes(32).toString('hex');
        user.token = token;
        await user.save();

        // Return success response with token
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error during login'
        });
    }
};

const register = async (req, res) => {
    try {
        const { name, username, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username: username.toLowerCase().trim() });
        if (existingUser) {
            return res.status(httpStatus.CONFLICT).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Create new user
        const user = new User({
            name: name.trim(),
            username: username.toLowerCase().trim(),
            password
        });

        // Save user (password will be hashed by pre-save hook)
        await user.save();

        // Return success response
        res.status(httpStatus.CREATED).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error during registration'
        });
    }
};

const getUserHistory=async(req,res)=>{
    const {token}=req.query;
    try{
        const user=await User.findOne({token:token});
        const meetings= await Meeting.find({user_id:user.username});
        res.json(meetings)
    }catch(e){
        res.json({message:`Something went wrong ${e}`});
    }
}
const addToHistory=async(req,res)=>{
    const {token,meetingCode}=req.body;

    try {
        const user=await User.findOne({token:token});
        const newMeeting=new Meeting({
            user_id:user.username,
            meetingCode: meetingCode,
        })
        await newMeeting.save();
        res.status(httpStatus.CREATED).json({message:"Added code to history"})
    }catch(e){
        res.json({message:`Something went wrong ${e}`})
    }
}

export { login, register,getUserHistory,addToHistory };