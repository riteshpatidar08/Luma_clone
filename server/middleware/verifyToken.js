import jwt from 'jsonwebtoken'

const verifyToken = (req,res,next) => {
    try {
     if(req.headers.authorization){
        console.log(req.headers.authorization)
        const token = req.headers.authorization.split(' ')[1];
        console.log(token)
        if(token){
        const decoded = jwt.verify(token ,  process.env.JWT_SECRET_KEY);

        req.user = decoded ;
        next();
        
        } else {
            return res.status(401).json({
                message : "Invlid Token"
            })
        }
     }else {
        return res.status(404).json({
            message : "No token found"

        })
     }
    } catch (error) {
        
    }
}

export default verifyToken
// POST /events  , {} 
//  token kiase bhju ??