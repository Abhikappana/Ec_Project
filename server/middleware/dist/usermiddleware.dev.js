"use strict";

var isUser = function isUser(req, res, next) {
  return regeneratorRuntime.async(function isUser$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          try {
            if (req.session.isUser) {
              next();
            } else {
              res.redirect('/login');
            }
          } catch (err) {
            console.log("user controller isUser error: " + err);
            res.status(500).send("Internal Server Error");
          }

        case 1:
        case "end":
          return _context.stop();
      }
    }
  });
};

module.exports = {
  isUser: isUser
};