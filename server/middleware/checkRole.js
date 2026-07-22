const checkRole = (roles) => {
  return (req, res, next) => {
    if (req.user) {
      if (roles.includes(req.user.role)) {
        return next();
      } else {
        return res.status(403).json({
          messgae: 'You are not authorized to access this resource',
        });
      }
    }
  };
};

export default checkRole;
