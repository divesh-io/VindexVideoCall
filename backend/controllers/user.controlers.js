import {User} from "../models/user.model.js";
import HttpStatus from "http-status";
import bcrypt,{hash} from "bcrypt";
import crypto from "crypto";

const login = async (req, res) => {
   const { username, password } = req.body;

   if (!(username && password)) {
       return res.status(HttpStatus.BAD_REQUEST).send("All fields are required");
   }

   try {
       const existingUser = await User.findOne({ username });

       if (!existingUser) {
           return res.status(HttpStatus.BAD_REQUEST).send("User does not exist");
       }

       const isPasswordValid = await bcrypt.compare(password, existingUser.password);

       if (!isPasswordValid) {
           return res.status(HttpStatus.UNAUTHORIZED).send("Invalid password");
       }

       const token = crypto.randomBytes(64).toString("hex");
       existingUser.token = token;
       await existingUser.save();

       return res.status(HttpStatus.OK).send({ token });
   } catch (e) {
       return res.status(HttpStatus.BAD_REQUEST).send(e.message || e);
   }
};



const register = async (req,res) =>{
    const {name,username,password} = req.body;

    try{
        let existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(HttpStatus.BAD_REQUEST).send("User already exists");
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = new User({
            name,
            username,
            password:hashedPassword,
            
        });
        console.log(newUser);
        await newUser.save();
        return res.status(HttpStatus.OK).send("User created successfully");

    }catch(err){
        res.status(HttpStatus.BAD_REQUEST).send({message:err.message});
    }
}


export {login, register};
