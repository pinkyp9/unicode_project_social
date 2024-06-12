import jwt from 'jsonwebtoken';

const authenticateUser = async(req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Token not provided.' });
    }
    jwt.verify(token, process.env.JWT_SECRET,(err,decoded)=>{
        if(err){
            return res.status(401).json({message:'error'});
        }
        req.userId = decoded.userId;
        next();
    });
};

export default authenticateUser;